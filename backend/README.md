# Portfolio backend

Hono の `portfolio-backend` Worker が、お問い合わせ送信と Discord・Spotify の状態取得を担当し、`https://api.t4ko.pet` で公開します。ローカル開発では Web Worker から Service Binding で接続します。

## ローカル設定

リポジトリルートで実行します。

```sh
cp env.example .env
cp backend/.dev.vars.example backend/.dev.vars
nix develop
bun run dev
```

| 設定                                                 | 用途                           |
| ---------------------------------------------------- | ------------------------------ |
| `.env` の `VITE_TURNSTILE_SITE_KEY`                  | お問い合わせフォームの公開キー |
| `backend/.dev.vars` の `CONTACT_DISCORD_WEBHOOK_URL` | お問い合わせの送信先           |
| `backend/.dev.vars` の `TURNSTILE_SECRET_KEY`        | サーバー側の Turnstile 検証    |

ローカル設定ファイルは Git 管理対象外です。Webhook・Turnstile 秘密キー・`CONTACT_RATE_LIMITER` binding のいずれかが欠けると、お問い合わせは `503` を返します。状態取得には Bot token などの設定は不要です。

## API

本番フロントは `https://api.t4ko.pet` に接続します。CORS は `https://t4ko.pet` と `https://www.t4ko.pet` を許可します。ローカル開発では同じ origin の `/api/*` を使用します。要求・応答は `shared/` の Zod スキーマと Hono の `AppType` で定義します。

| Method | Path            | 応答                                                   |
| ------ | --------------- | ------------------------------------------------------ |
| GET    | `/api/health`   | `200 { "ok": true }`。外部接続の正常性は含みません     |
| POST   | `/api/contact`  | 検証・Webhook 配送の成功時 `200 { "ok": true }`        |
| GET    | `/api/presence` | 取得状態・Discord ステータス・Spotify 曲情報・取得時刻 |

お問い合わせは `name`・`email`・`subject`・`message` と `turnstileToken` を JSON で送信します。`website` は honeypot です。本文は 10〜2,000 文字、要求全体は 16 KiB まで。送信回数は IP 別に60秒あたり5回に制限します。送信 API の自動再試行はしません。

エラーは `{ "error": { "code": "...", "message": "...", "issues": {} } }` 形式です。`issues` は入力検証時のみ付きます。`400` は入力・認証失敗、`413` はサイズ超過、`415` は JSON 以外、`429` は回数制限（`Retry-After: 60`）、`502` は外部取得・配送失敗、`503` は設定不足です。

## Discord・Spotify の取得

取得元は [status.json](https://xs492099.xsrv.jp/status.json) です。Hono が応答を検証・整形し、画面は表示中のみ30秒ごとに取得します。バックエンドの外部取得には8秒のタイムアウトと15秒の Cloudflare キャッシュ設定を使います。常駐処理・WebSocket 配信・新しい Durable Object は使用しません。

Spotify 情報がない場合は「再生なし」、取得に失敗した場合は「取得不可」と表示します。再生位置・曲の長さは取得元のミリ秒から秒へ変換し、取得元の記録時刻からの経過を再生位置に加算します。公開する `updatedAt` は取得・整形時刻で、取得元 Bot の稼働やデータの鮮度を保証するものではありません。

## デプロイ

バックエンドの本番 secrets は `wrangler secret put <NAME> --config backend/wrangler.jsonc` で登録します。ローカルの `.dev.vars` はアップロードされません。`VITE_TURNSTILE_SITE_KEY` は Web のビルド環境に設定します。

`bun run deploy` はビルド後にバックエンド、Web の順にデプロイします。以前から Web Worker に存在する `SpotifyStatusDO` は既存データ保持用の宣言のみ残しており、状態取得には利用しません。

公開後は `https://api.t4ko.pet/api/health` と `https://api.t4ko.pet/api/presence` で応答を確認できます。
