set windows-shell := ["powershell.exe", "-NoLogo", "-NoProfile", "-Command"]
set shell := ["bash", "-cu"]

# 既定: タスク一覧
default:
    @just --list

# 依存をインストール (mise 配下のツール + pnpm 依存)
install:
    mise install
    pnpm install

# 開発サーバを起動 (Next.js)
dev:
    pnpm dev

# 本番ビルド (Next.js)
build:
    pnpm build

# 本番起動 (next start)
start:
    pnpm start

# ビルド成果物をローカル配信 (build 後に start)
preview: build
    pnpm preview

# Lint (Next.js / ESLint)
lint:
    pnpm lint

# フォーマット (Vite+ / Oxfmt)
format:
    pnpm format

# 型チェック (tsc --noEmit)
typecheck:
    pnpm typecheck

# Vite+ の統合チェック (lint + fmt + typecheck)
check:
    pnpm check

# CI 相当: 静的チェック + ビルドまで通す
ci: check build
