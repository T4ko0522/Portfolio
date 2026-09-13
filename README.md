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
- `backend`：お問い合わせ送信と `status.json` の取得を担当する独立した Hono Worker
- `shared`：フロントとバックエンド共通の入力・応答スキーマ

紹介・作品の本文は静的生成し、画面幅に依存する制御・演出・誕生日の残日数はクライアントで更新します。PC とモバイルのナビゲーションは別々に管理します。

## バックエンド

本番フロントは `https://api.t4ko.pet` の Hono API に接続します。`bun run dev` では Web と Hono Worker を一緒に起動し、ローカルの `/api/*` を Service Binding 経由でバックエンドへ転送します。

お問い合わせは Turnstile 検証後に Discord Webhook へ送信します。Discord・Spotify の表示は、Hono 経由で既存の `status.json` から取得します。[設定と API](backend/README.md)を参照してください。

## License

[Apache License 2.0](LICENSE)
