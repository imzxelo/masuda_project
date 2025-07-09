# Singer's Challenge Frontend

ボーカルスクール向けの採点・フィードバックシステムのフロントエンド

## 概要

Singer's Challengeは、ボーカルスクールの講師が生徒のパフォーマンスを評価し、自動的にレポートを生成するシステムです。10名の講師が以下の4項目で評価を行います：

- 音程 (Pitch) - 0-10点
- リズム (Rhythm) - 0-10点
- 表現 (Expression) - 0-10点
- テクニック (Technique) - 0-10点

**評価システム**: 4項目 × 10点 × 10名講師 = 400点満点

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

- 📊 講師向け採点入力UI（10点満点スライダー）
- 📝 評価項目ごとのコメント入力機能
- 📈 リアルタイムレーダーチャート表示
- 🗄️ Supabaseとのデータ連携
- 🔄 n8nへの自動データ送信とレポート生成
- 📱 レスポンシブデザイン
- 👥 10名講師の認証・選択システム

## 評価システム詳細

### 評価項目とコメント機能
各評価項目に対して以下の機能を提供：

1. **スライダー評価（0-10点）**
   - 音程：ピッチの正確性
   - リズム：テンポとビートの正確性
   - 表現：感情表現とダイナミクス
   - テクニック：発声技術と技巧

2. **項目別コメント機能**
   - 各評価項目に対する詳細なフィードバック
   - 自由記述形式でのコメント入力
   - レポート生成時のコメント活用

3. **統合評価**
   - 4項目の合計評価（最大40点/講師）
   - 10名講師による総合評価（最大400点）
   - リアルタイムでの評価結果可視化