# Portfolio

[T4ko0522 のポートフォリオ](https://t4ko.pet)。TanStack Start・React・Tailwind CSS で構築し、Cloudflare Workers に配信します。

## 開発

Linux x86_64 では、Nix で Node.js・Bun・ネイティブ依存を固定し、JavaScript パッケージは `bun.lock` で管理します。

```sh
nix develop
bun install --frozen-lockfile
bun run dev
```

```sh
bun run check       # Vite Plus による整形・Lint・型検査
bun run test        # 非 UI ロジックのテスト
bun run build      # Workers 向けビルド・静的事前生成
bun run preview    # ビルド結果のローカル確認
```

## 構成

- `src/routes`：ルート・HTML・メタデータ
- `src/features`：home・profile・works・presence・contact の画面、データ、ロジック
- `src/components`：共通 UI と背景演出
- `src/styles`：共通 CSS・フォント

紹介・作品の本文は静的生成し、画面幅に依存する制御・演出・誕生日の残日数はクライアントで更新します。PC とモバイルのナビゲーションは別々に管理します。

## 接続待ち

Discord・Spotify は未接続です。外部 API／WebSocket 接続は後続対応で、このプロジェクトには取得 API を実装しません。既存 Durable Object は保存データを削除しないためのクラス定義だけを残し、フロントからは接続しません。

お問い合わせフォームは入力検証まで対応しています。送信 API は後続対応で、送信操作時にはメールでの連絡を案内します。任意の公開 Turnstile キーは `env.example` を参照してください。

## License

[Apache License 2.0](LICENSE)
