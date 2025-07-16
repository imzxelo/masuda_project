# Singer's Challenge Frontend

ボーカルスクール向けの採点・フィードバックシステム（完全版）

## 🎯 プロジェクト概要

Singer's Challengeは、ボーカルスクールの講師が生徒のパフォーマンスを評価し、自動的にレポートを生成する包括的なシステムです。10名の講師が4項目で評価を行い、n8nとの連携により自動レポート生成を実現します。

### 評価システム
- **音程 (Pitch)** - 0-10点
- **リズム (Rhythm)** - 0-10点  
- **表現 (Expression)** - 0-10点
- **テクニック (Technique)** - 0-10点

**総合評価**: 4項目 × 10点 × 10名講師 = 最大400点

## 🚀 実装状況（Phase 6 完了）

### ✅ 完全実装済み機能

#### 🔐 認証・セキュリティシステム
- **2段階認証システム**
  - 共有パスワード認証（`myUU-2025`）
  - Supabase Auth による講師認証（メール・パスワード）
- **セッション永続化**
  - SessionStorage による状態保持
  - ページ間移動での認証状態維持
- **自動プロファイル管理**
  - 新規講師登録時の自動プロファイル作成
  - 初回セットアップフロー
  - プロファイル編集機能

#### 📊 評価システム（完全動作）
- **包括的評価フロー**
  - 生徒選択（検索・フィルタリング付き）
  - 動画レコード選択（楽曲・日付管理）
  - 4項目スコアリング（0-10点スライダー）
  - 項目別コメント入力
  - リアルタイムレーダーチャート表示
- **データ管理**
  - Supabase PostgreSQL による完全なCRUD操作
  - Row Level Security (RLS) 対応
  - リアルタイム同期

#### 🗄️ データ管理・履歴機能
- **評価履歴表示**
  - 生徒別評価履歴の表示
  - 詳細フィルタリング（日付範囲等）
  - 評価詳細の展開表示
- **統計・分析ダッシュボード**
  - 総評価数、平均スコアの表示
  - カテゴリ別平均スコア可視化
  - 日別評価数推移グラフ
  - 楽曲別パフォーマンス分析

#### 🎵 動画レコード管理
- **楽曲管理システム**
  - 楽曲ID・タイトル・録音日付の管理
  - 生徒別楽曲履歴
  - 検索・フィルタリング機能

#### 🔗 外部システム連携
- **n8n Webhook 統合**
  - 評価完了時の自動レポート生成
  - リトライ機能付きエラーハンドリング
  - 開発環境での動作シミュレーション

#### 💅 ユーザーエクスペリエンス
- **レスポンシブデザイン**
  - Tailwind CSS による モダンUI
  - モバイル・タブレット対応
- **リアルタイムフィードバック**
  - Toast通知システム
  - ローディング状態表示
  - エラーハンドリング

## 🛠️ 技術スタック

### フロントエンド
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.5
- **Styling**: Tailwind CSS 3.4
- **State Management**: Zustand 4.5
- **Charts**: Recharts 2.12
- **UI Components**: カスタムコンポーネントライブラリ

### バックエンド・データベース
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Real-time subscriptions
- **Security**: Row Level Security (RLS)

### 外部連携
- **Automation**: n8n Webhook integration
- **Report Generation**: 自動レポート生成システム

### 開発ツール
- **Type Checking**: TypeScript
- **Linting**: ESLint
- **CSS Processing**: PostCSS
- **Package Manager**: npm

## 📋 セットアップガイド

### 1. 環境構築

```bash
# リポジトリのクローン
git clone <repository-url>
cd masuda_project

# 依存関係のインストール
npm install

# 環境変数ファイルの作成
cp .env.local.example .env.local
```

### 2. 環境変数の設定

`.env.local` ファイルを編集：

```bash
# Supabase設定（必須）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# n8n Webhook設定（オプション）
NEXT_PUBLIC_N8N_WEBHOOK_URL=your_n8n_webhook_url
```

### 3. データベースセットアップ

Supabase Dashboard の SQL Editor で以下のスキーマを実行：

#### テーブル作成

```sql
-- 講師テーブル
CREATE TABLE instructors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  auth_user_id UUID UNIQUE REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 生徒テーブル
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  notes TEXT, -- 旧grade フィールドから変更
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 動画レコードテーブル
CREATE TABLE video_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) NOT NULL,
  song_id TEXT NOT NULL,
  song_title TEXT NOT NULL,
  recorded_at DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 評価テーブル（個別カラム構造）
CREATE TABLE evaluations_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) NOT NULL,
  instructor_id UUID REFERENCES instructors(id) NOT NULL,
  instructor_auth_user_id UUID REFERENCES auth.users(id) NOT NULL,
  video_record_id UUID REFERENCES video_records(id) NOT NULL,
  pitch INTEGER CHECK (pitch BETWEEN 0 AND 10) NOT NULL,
  rhythm INTEGER CHECK (rhythm BETWEEN 0 AND 10) NOT NULL,
  expression INTEGER CHECK (expression BETWEEN 0 AND 10) NOT NULL,
  technique INTEGER CHECK (technique BETWEEN 0 AND 10) NOT NULL,
  pitch_comment TEXT,
  rhythm_comment TEXT,
  expression_comment TEXT,
  technique_comment TEXT,
  sent_to_n8n BOOLEAN DEFAULT false,
  sent_to_n8n_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### RLS ポリシー設定

```sql
-- RLS有効化
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations_v2 ENABLE ROW LEVEL SECURITY;

-- ポリシー作成（認証済みユーザーアクセス）
CREATE POLICY "Allow authenticated access" ON instructors FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON students FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON video_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated access" ON evaluations_v2 FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 評価テーブル: 講師は自分の評価のみアクセス可能
CREATE POLICY "Instructors can only access their own evaluations" ON evaluations_v2 
FOR ALL TO authenticated 
USING (instructor_auth_user_id = auth.uid()) 
WITH CHECK (instructor_auth_user_id = auth.uid());
```

### 4. 開発サーバー起動

```bash
# 開発サーバー起動
npm run dev

# 接続テスト
# ブラウザで http://localhost:3000/test にアクセス
```

## 🏗️ プロジェクト構造

```
src/
├── app/                      # Next.js App Router
│   ├── globals.css          # グローバルスタイル
│   ├── layout.tsx           # ルートレイアウト
│   ├── page.tsx             # メイン評価画面
│   ├── history/             # 履歴・統計画面
│   │   └── page.tsx
│   └── test/                # 接続テスト
│       └── page.tsx
├── components/               # UIコンポーネント
│   ├── AuthWrapper.tsx      # 認証フロー管理
│   ├── SupabaseAuthProvider.tsx # 認証プロバイダー
│   ├── EvaluationWorkflow.tsx   # 評価ワークフロー
│   ├── EvaluationForm.tsx       # 評価入力フォーム
│   ├── EvaluationHistory.tsx    # 評価履歴表示
│   ├── EvaluationStats.tsx      # 統計ダッシュボード
│   ├── StudentSelect.tsx        # 生徒選択コンポーネント
│   ├── InstructorProfileEdit.tsx # プロファイル編集
│   ├── FirstTimeSetup.tsx       # 初回セットアップ
│   └── ui/                      # 基本UIコンポーネント
├── lib/                     # ユーティリティ・設定
│   ├── api/                 # API関数
│   │   ├── students.ts
│   │   ├── instructors.ts
│   │   ├── evaluations.ts
│   │   ├── video-records.ts
│   │   └── instructor-profile.ts
│   ├── supabase/            # Supabase設定
│   │   ├── client.ts
│   │   └── auth-client.ts
│   └── utils.ts             # ユーティリティ関数
├── hooks/                   # カスタムフック
│   ├── useSharedAuth.ts     # 共有認証フック
│   └── useEvaluation.ts     # 評価管理フック
├── stores/                  # Zustand状態管理
│   ├── useEvaluationStore.ts
│   ├── useInstructorStore.ts
│   ├── useStudentStore.ts
│   └── useUIStore.ts
└── types/                   # TypeScript型定義
    ├── api.ts
    ├── student.ts
    ├── instructor.ts
    ├── evaluation.ts
    └── video-record.ts
```

## 🔧 利用開始手順

### 1. システムアクセス

1. `http://localhost:3000` にアクセス
2. 共有パスワード `myUU-2025` を入力
3. 講師アカウントでサインアップ/サインイン

### 2. 初回セットアップ

新規講師登録時：
1. メールアドレス・パスワードでサインアップ
2. 講師名の設定（初回セットアップ画面）
3. プロファイル情報の確認・編集

### 3. 生徒・楽曲の登録

評価開始前に必要なデータを登録：

#### 生徒登録
1. 生徒選択画面で「新しい生徒を登録」
2. 名前、メールアドレス（任意）、メモを入力
3. 登録完了後、即座に選択可能

#### 動画レコード登録
1. 生徒選択後、「新しい動画レコードを登録」
2. 楽曲ID、楽曲タイトル、録音日付を入力
3. 登録完了後、評価対象として選択可能

### 4. 評価実行

1. **生徒選択**: 検索・フィルタリングで対象生徒を選択
2. **楽曲選択**: 評価対象の動画レコードを選択
3. **評価入力**: 4項目をスライダーで評価（0-10点）
4. **コメント入力**: 各項目に詳細コメントを記入（任意）
5. **確認・送信**: 評価内容を確認してデータベースに保存
6. **自動連携**: n8nへの自動送信でレポート生成開始

### 5. 履歴・統計の確認

1. 「評価履歴・統計」タブに移動
2. **評価履歴**: 過去の評価データの詳細確認
3. **統計・分析**: 生徒のパフォーマンス分析・トレンド表示

## 🔍 主要機能詳細

### 認証システム
- **2段階セキュリティ**: 共有パスワード + 個人認証
- **自動プロファイル管理**: 新規ユーザーの自動セットアップ
- **セッション永続化**: ページ遷移での状態保持

### 評価システム
- **包括的ワークフロー**: 生徒選択→楽曲選択→評価→送信
- **リアルタイム可視化**: レーダーチャートでの即座フィードバック
- **項目別コメント**: 4評価項目それぞれに詳細コメント

### データ管理
- **完全CRUD操作**: 全エンティティの作成・読取・更新・削除
- **高度な検索**: 部分一致・フィルタリング機能
- **リアルタイム同期**: Supabaseによるデータ同期

### 統計・分析
- **包括的ダッシュボード**: 総評価数、平均スコア、トレンド分析
- **可視化**: Rechartsによる豊富なグラフ表示
- **詳細フィルタリング**: 日付範囲、生徒別等の絞り込み

## 📊 npm スクリプト

```bash
# 開発
npm run dev          # 開発サーバー起動 (http://localhost:3000)
npm run build        # プロダクションビルド
npm run start        # プロダクションサーバー起動

# コード品質
npm run lint         # ESLintによるコードチェック
npm run type-check   # TypeScript型チェック
```

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. 認証エラー
**問題**: ログイン後に認証状態が保持されない
**解決**: 
- SessionStorage をクリア（開発者ツール → Application → Storage）
- ページをリフレッシュ
- 環境変数 `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を確認

#### 2. RLS (Row Level Security) エラー
**問題**: "new row violates row-level security policy" エラー
**解決**:
- 上記データベースセットアップのRLSポリシーを実行
- Supabase Dashboard でポリシーが正しく適用されているか確認

#### 3. 評価送信エラー
**問題**: 評価データが保存されない
**解決**:
- ブラウザのコンソールでエラーメッセージを確認
- `instructor_auth_user_id` が正しく設定されているか確認
- データベースの外部キー制約を確認

#### 4. n8n Webhook エラー
**問題**: レポート生成が失敗する
**解決**:
- 開発環境では自動的にシミュレート処理
- 本番環境では `NEXT_PUBLIC_N8N_WEBHOOK_URL` を確認
- n8nワークフローの稼働状況を確認

### デバッグ手順

1. **接続テスト実行**
```bash
# ブラウザで以下にアクセス
http://localhost:3000/test
```

2. **ブラウザ開発者ツール**
- Console: エラーメッセージの確認
- Network: API通信の状況確認
- Application: LocalStorage/SessionStorageの状態確認

3. **Supabase ダッシュボード**
- Table Editor: データの直接確認
- Authentication: ユーザー登録状況の確認
- API Logs: データベースアクセスログの確認

## 🚀 本番環境デプロイ

### Vercel デプロイ

```bash
# Vercel CLI インストール
npm i -g vercel

# プロジェクトをデプロイ
vercel

# 環境変数を設定
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXT_PUBLIC_N8N_WEBHOOK_URL

# 再デプロイ
vercel --prod
```

### 環境変数チェックリスト

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase プロジェクトURL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 匿名キー
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase サービスロールキー
- [ ] `NEXT_PUBLIC_N8N_WEBHOOK_URL` - n8n Webhook URL（任意）

## 📈 システム運用

### 監視・ログ
- Supabase ダッシュボードでのデータベース監視
- Vercel Analytics でのパフォーマンス監視
- ブラウザコンソールでのフロントエンドエラー監視

### バックアップ
- Supabase による自動データベースバックアップ
- 定期的な手動データエクスポート推奨

### スケーリング
- Supabase の自動スケーリング機能
- CDN によるグローバル配信（Vercel）

## 🤝 貢献・開発

### コードスタイル
- TypeScript strict mode
- ESLint + Prettier による自動フォーマット
- 2スペースインデント
- 関数コンポーネントのみ使用

### 開発ワークフロー
1. 機能ブランチで開発: `feature/[機能名]`
2. TypeScript型安全性の確保
3. コミットメッセージ: `feat:`, `fix:`, `docs:` プレフィックス使用
4. PR マージ前のテスト必須

## 📝 ライセンス

プライベートプロジェクト - 無断転載・配布禁止

---

**🎵 Singer's Challenge - ボーカルスクールの未来を創る評価システム**

*Powered by Next.js, Supabase, and n8n*