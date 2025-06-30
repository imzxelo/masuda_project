# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Singer's Challenge Frontend

## Overview
ボーカルスクール向けの採点・フィードバックシステムのフロントエンド。
10名の講師が生徒のパフォーマンスを評価し、自動的にレポートを生成するシステム。

## Architecture
- **採点入力UI**: 講師が使用する評価入力インターフェース
- **データ連携**: Supabaseを使用したリアルタイムデータ同期
- **自動化連携**: n8n webhookへのデータ送信

## Technologies
- Framework: Next.js 14 (App Router)
- Language: TypeScript 5.3
- Database: Supabase (PostgreSQL)
- Styling: Tailwind CSS 3.4
- Charts: Recharts
- State Management: React Context API / Zustand

## Code Style Guidelines
- 2スペースインデント
- 関数コンポーネントのみ使用（クラスコンポーネント禁止）
- カスタムフックは`use`プレフィックス
- APIコールは`/lib/api/`に集約
- エラーハンドリングは必須

## Project Structure
```
src/
├── app/              # Next.js App Router
├── components/       # 再利用可能なコンポーネント
├── lib/             # ユーティリティ関数
│   ├── api/         # API関連
│   └── supabase/    # Supabase設定
├── hooks/           # カスタムフック
└── types/           # TypeScript型定義
```

## Development Workflow
1. 機能ブランチで開発: `feature/[機能名]`
2. コミットメッセージ: `feat:`, `fix:`, `docs:` プレフィックス使用
3. PRマージ前にテスト必須

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `N8N_WEBHOOK_URL`

## Key Features
- 講師向け採点入力UI（10名の講師が使用）
- 4項目評価：音程、リズム、表現、テクニック
- リアルタイムレーダーチャート表示
- Supabaseとの連携