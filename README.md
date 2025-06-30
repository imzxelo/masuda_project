# Singer's Challenge Frontend

ボーカルスクール向けの採点・フィードバックシステムのフロントエンド

## 概要

Singer's Challengeは、ボーカルスクールの講師が生徒のパフォーマンスを評価し、自動的にレポートを生成するシステムです。10名の講師が以下の4項目で評価を行います：

- 音程 (Pitch)
- リズム (Rhythm) 
- 表現 (Expression)
- テクニック (Technique)

## 技術スタック

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.3
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 3.4
- **Charts**: Recharts
- **State Management**: Zustand

## 開発環境のセットアップ

1. 依存関係をインストール
```bash
npm install
```

2. 環境変数を設定
```bash
cp .env.local.example .env.local
```

3. `.env.local` ファイルを編集し、必要な環境変数を設定

4. 開発サーバーを起動
```bash
npm run dev
```

## 環境変数

- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトのURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabaseの匿名キー
- `N8N_WEBHOOK_URL`: n8n WebhookのURL

## スクリプト

- `npm run dev`: 開発サーバーを起動
- `npm run build`: プロダクションビルド
- `npm run start`: プロダクションサーバーを起動
- `npm run lint`: ESLintでコードをチェック
- `npm run type-check`: TypeScriptの型チェック

## プロジェクト構造

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

## 主要機能

- 📊 講師向け採点入力UI
- 📈 リアルタイムレーダーチャート表示
- 🗄️ Supabaseとのデータ連携
- 🔄 n8nへの自動データ送信
- 📱 レスポンシブデザイン