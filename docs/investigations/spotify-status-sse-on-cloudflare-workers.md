# Spotify SSE エンドポイントの Cloudflare Workers 互換性調査

対象: `app/api/v1/spotify-status/route.ts`
PR: #25 (Vercel → Cloudflare Workers 移行)

## 前提 (要確認)

結論の温度は Cloudflare Workers のプランで大きく変わる。以下で場合分けする。

- **Free プラン**: CPU 10 ms / subrequest 50 → SSE は実質不可能
- **Paid (Standard / Bundled $5/月)**: CPU 30 s〜5 min / subrequest 1000 → 短時間は動くが設計不適合
- どちらの想定で本 PR を運用するかは別途確認したい

## 現状の実装

### サーバー (`app/api/v1/spotify-status/route.ts`)

- `ReadableStream` を返す SSE エンドポイント (`text/event-stream`)
- `setInterval(..., 5000)` で 5 秒ごとに外部 API (`https://xs492099.xsrv.jp/status.json`) を fetch
- 差分 (Spotify トラック / Discord ステータス / activities) を検知したら `controller.enqueue`
- `request.signal` の `abort` で `clearInterval` + `controller.close`
- master では `export const runtime = 'edge'` だったが、**PR では commit `2d534a2` で削除済み** (OpenNext は Edge Runtime ディレクティブを解釈しないため)

### クライアント (`components/home-page.tsx:291-391`)

- `EventSource('/api/v1/spotify-status')` で接続
- `onerror` で 3 秒後に自動再接続
- アンマウント時に `eventSource.close()`

### wrangler.jsonc (PR ブランチ)

- `compatibility_flags: ["nodejs_compat", "global_fetch_strictly_public"]`
- `limits` 未設定 (CPU 上限の明示なし)

---

## Cloudflare Workers の制約と挙動

### 1. Streaming Response 自体は動く

Workers は `ReadableStream` を返す `Response` をネイティブサポート。`text/event-stream` ヘッダーも問題ない。**SSE が「フォーマットとして」動くかは Yes**。

### 2. ⚠️ Subrequests 上限 (これが最大のブロッカー)

| プラン | 1 リクエストあたりの subrequest 上限 | 5 秒間隔で到達する時間 |
|--------|------|------|
| Free | 50 | 約 4 分 10 秒 |
| Paid (Bundled / Standard) | 1000 | 約 83 分 20 秒 |

`setInterval` で 5 秒ごとに `fetch` するため、1 つの SSE 接続 = 1 つの Worker invocation の中で subrequest が累積する。上限に達した瞬間に `fetch` が失敗し、SSE が事実上ダウンする。

→ クライアントの自動再接続で「見かけ上」復活はするが、Paid プランでもユーザーがタブを開きっぱなしにすると **1 時間強で必ず切断 → 再接続** が発生する。Free だと数分で切断。

### 3. ⚠️ CPU Time 上限

| プラン | 1 invocation の CPU time デフォルト | 最大 |
|--------|------|------|
| Free | 10 ms | 10 ms |
| Paid (Bundled / Standard) | 30 s | 5 min (`limits.cpu_ms` で延長) |

Free では即死 (Free プランで Workers を使うなら SSE は実質不可能)。Paid でも、`setInterval` の callback 内で行う JSON パース・差分検知の CPU が累積し、数十分〜数時間で枯渇する。

`wrangler.jsonc` には `limits.cpu_ms` が未設定 → デフォルト 30 秒。**まず確実にここで切れる**。

### 4. `setInterval` と I/O Context (実測必須・確度は中)

Workers の `nodejs_compat` で `setInterval` 自体は利用可能。Workers の I/O オブジェクトは「元のリクエストの I/O context 内でしか操作できない」制約があるが、本実装は `ReadableStream` の `start(controller)` の **内側** で `setInterval` を建てているため、controller は元の request の I/O context を握ったまま callback まで持ち越される構造になっている。OpenNext のラッパー (`.open-next/worker.js`) が特殊な isolation をしていない限り、**`Cannot perform I/O on behalf of a different request` は実際には出にくい**。

ただし OpenNext 側の挙動は完全に保証されていないため、`wrangler tail` でログを確認するまで「確実に動く」とは言えない。**確定的に効くブロッカーは subrequest と CPU の方**。

### 5. Duration 課金 (Paid プラン)

Workers Paid は GB-s / CPU-ms ベース課金。SSE 接続は invocation を長時間保持するため、**同時接続数 × 接続時間** が課金に直結する。1 接続が数分〜数十分維持されるたびに duration が積み上がる。

ポートフォリオサイトのトラフィックなら金額は知れているが、設計上は「Workers にやらせて良いワークロード」ではない。

### 6. クライアント自動再接続による負の連鎖

`onerror → 3 秒後 connectSSE()` が組み込まれているため、サーバーが subrequest/CPU で落ちても **自動で再接続が走る**。結果、

- 短期的には「動いているように見える」
- 各再接続が新しい Worker invocation を発生 → さらに課金/quota を消費
- 5 秒の差分検知 polling が **実質常時動き続ける**

---

## 判定

| 観点 | 判定 |
|------|------|
| 「ビルドが通って一見動く」 | ✅ おそらく動く (PR commit `2d534a2` で edge runtime を外しているため OpenNext バンドルは成立) |
| 「短時間 (数十秒〜数分) は安定動作」 | ⚠️ I/O context 問題が出なければ動く。実測必須 |
| 「長時間 (1 時間以上) の安定接続」 | ❌ subrequest 上限と CPU 上限で必ず切断 |
| 「Free プランで実用」 | ❌ 不可能 (CPU 10 ms / subrequest 50) |
| 「Workers の設計思想と適合」 | ❌ long-lived stream + 定期 fetch ループは Workers 不適 |

**結論: 現状の SSE 実装は Cloudflare Workers 上で "壊れたまま見かけ上動く" 状態になる可能性が高い。クライアントの自動再接続でユーザーは気付かない可能性もあるが、設計上は破綻している。**

---

## 推奨される対応 (優先順)

### A. クライアント側 Polling に置き換える (最小工数・推奨)

- サーバー `route.ts` を単純な GET (現在の `fetchSpotifyData()` の結果を JSON で返すだけ) に変更
- クライアントは `setInterval(() => fetch('/api/v1/spotify-status').then(...), 5000)` で polling
- 各リクエストは subrequest 1 / CPU 数 ms で完結 → Workers と完全に適合
- **Cloudflare Cache API で 5 秒 TTL** を噛ませると、同時接続が N 人いても origin への fetch は **5 秒に 1 回 (= 1/12 秒)** まで圧縮できる。例えば:
  ```ts
  const cache = caches.default
  const cached = await cache.match(request)
  if (cached) return cached

  const data = await fetchSpotifyData()
  const res = new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 's-maxage=5' },
  })
  ctx.waitUntil(cache.put(request, res.clone()))
  return res
  ```
- 差分検知ロジックはクライアントで持つか、サーバーで Cache TTL に任せる。

### B. Durable Objects + WebSocket Hibernation に置き換える

- 1 つの Durable Object が外部 API を定期 fetch (Cron Triggers から起動)
- クライアントは Durable Object に WebSocket で接続
- Hibernation API でアイドル接続のコストをほぼゼロに
- 工数大、ただし Cloudflare 推奨設計

### C. lanyard などの外部 Discord プレゼンス API に切り替え

- Discord の rich presence (Spotify activity) は [Lanyard](https://github.com/Phineas/lanyard) などの WebSocket サービスでブラウザから直接購読できる
- Worker を介さない → quota 完全回避
- 外部依存が増える

### D. SSE を維持しつつ最低限のハードニング (非推奨だが緊急回避)

`wrangler.jsonc` に以下を追加し、interval を伸ばせば「切れにくく」はできる。

```jsonc
"limits": { "cpu_ms": 300000 }  // CPU 5 分
```

- subrequest 上限を計算すると、polling 間隔を **5 秒 → 10 秒に伸ばす** だけで Paid 1000 limit = 約 2 時間 47 分にできる
- ただし subrequest 上限と I/O context リスクは残るため根本解決ではない

---

## 即時行動の提案

### 独立してすぐ入れるべき (SSE 改修と無関係)

- **`wrangler.jsonc` に `limits.cpu_ms` を明示**: デフォルト 30 秒だと数分以内に切れる可能性が高いため、最低限 `300000` (5 分) は入れておく
  ```jsonc
  "limits": { "cpu_ms": 300000 }
  ```

### 本筋 (SSE 改修)

1. **PR #25 のマージ前に**: 上記 A (Polling 化) のための小さな後続 PR を切る方が安全。PR #25 の範囲をこれ以上膨らませない
2. **マージ後の検証**:
   - `wrangler tail` で本番ログを確認 (I/O context エラー、subrequest 上限、CPU 超過のいずれが出るかを実測)
   - Cloudflare ダッシュボード → Workers & Pages → Analytics で `subrequests` / `cpu_time` / `errors` を監視

### このレポート自体の扱い

`docs/investigations/` 配下に置いてあるため、

- PR #25 に追加コミットとして含めるか
- master へ別 PR で出すか
- もしくは個人メモとして commit しないか

を選択する。SSE 改修自体は **必ず別 PR** に切り出すべき (PR #25 のスコープ外)。
