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
```bash
# Supabase設定（必須）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# n8n Webhook設定（オプション）
NEXT_PUBLIC_N8N_WEBHOOK_URL=your_n8n_webhook_url
```

4. 開発サーバーを起動
```bash
npm run dev
```

5. 接続テストを実行
```bash
# ブラウザで以下にアクセス
http://localhost:3000/test
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

## 🚀 現在の実装状況

### ✅ 完了済み (Phase 1-3)
- **基盤構築**: プロジェクト構造、設定ファイル、型定義
- **コアコンポーネント**: レーダーチャート、評価スライダー、講師認証、共通UI
- **状態管理**: Zustand stores (評価、講師、UI状態)
- **API連携**: Supabase CRUD操作、n8n webhook送信
- **環境構築**: 開発環境、接続テスト、デバッグ機能

### 🔄 進行中 (Phase 4準備)
- **メインページ統合**: 実際のAPI連携でのデモ動作確認
- **接続テスト**: Supabase ✅、n8n Webhook ✅

### 📋 次のステップ (Phase 4以降)
- **生徒選択機能**: 実際の生徒データベースからの選択
- **評価履歴表示**: 過去の評価データの表示
- **レポート確認**: n8nからのレポート生成結果確認
- **エラーハンドリング強化**: 本番環境対応

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

## 🔧 開発・デバッグ

### 接続テスト
システムの接続状況を確認:
```bash
# 開発サーバー起動後
http://localhost:3000/test
```

### 主要なエンドポイント
- **メインページ**: `http://localhost:3000/` - 評価システムのメイン画面
- **テストページ**: `http://localhost:3000/test` - 接続テストとデバッグ
- **Supabase**: 講師・生徒・評価データの管理
- **n8n Webhook**: 自動レポート生成トリガー