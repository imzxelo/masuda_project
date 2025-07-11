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
- 🎵 採点対象動画レコード管理
- 🔍 検索型選択UI（講師・生徒）
- ✅ 登録内容確認機能
- ✏️ 情報編集機能

## 🚀 現在の実装状況

### ✅ 完了済み (Phase 1-4)
- **基盤構築**: プロジェクト構造、設定ファイル、型定義
- **コアコンポーネント**: レーダーチャート、評価スライダー、講師認証、共通UI
- **状態管理**: Zustand stores (評価、講師、生徒、UI状態)
- **API連携**: Supabase CRUD操作、n8n webhook送信
- **環境構築**: 開発環境、接続テスト、デバッグ機能
- **登録機能**: システム内での講師・生徒登録機能
- **生徒選択機能**: 検索・フィルタリング付き生徒選択
- **評価システム**: 完全動作する評価入力・保存・送信

### 🎯 システム完成度
**コア機能**: 100% 完成 ✅
- 講師認証・選択
- 生徒選択（検索・フィルタリング）
- 評価入力（4項目 × 10点 + コメント）
- リアルタイムレーダーチャート
- データベース保存（evaluations_v2テーブル）
- n8nレポート生成連携

### 🚧 実装中 (Phase 5)
- **採点対象動画レコード管理**: 生徒の歌唱動画を管理・選択する機能
- **検索型選択UI**: 講師・生徒をtype-ahead形式で検索・選択
- **登録内容確認画面**: 新規登録時の確認フロー
- **編集機能**: 登録済み情報の編集・更新機能

### 📋 次のステップ (Phase 6以降)
- **評価履歴表示**: 過去の評価データの表示・管理・可視化
- **レポート管理**: n8nからのレポート生成結果確認・ダウンロード機能
- **統計ダッシュボード**: 講師・生徒別の評価統計・トレンド分析
- **エラーハンドリング強化**: 本番環境対応・監視・ログ機能
- **パフォーマンス最適化**: キャッシュ・遅延読み込み・バッチ処理

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

## 📋 システム利用開始手順

### 1. 初回セットアップ

**環境変数の設定:**
```bash
cp .env.local.example .env.local
```

`.env.local`に以下を設定:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_N8N_WEBHOOK_URL=your_n8n_webhook_url
```

**開発サーバー起動:**
```bash
npm install
npm run dev
```

### 2. データベースセットアップ

**必要なテーブル作成:**
Supabase Dashboard → SQL Editor で以下を実行:

```sql
-- 講師テーブル
CREATE TABLE instructors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 生徒テーブル
CREATE TABLE students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  grade TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 採点対象動画レコードテーブル
CREATE TABLE video_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) NOT NULL,
  song_id TEXT NOT NULL,
  song_title TEXT NOT NULL,
  recorded_at DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 評価テーブル（v2 - 個別カラム構造）
CREATE TABLE evaluations_v2 (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) NOT NULL,
  instructor_id UUID REFERENCES instructors(id) NOT NULL,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Row Level Security (RLS) ポリシーの設定:**
```sql
-- 各テーブルにRLSポリシーを設定
CREATE POLICY "Allow anonymous access on instructors" ON instructors FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous access on students" ON students FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous access on video_records" ON video_records FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anonymous access on evaluations_v2" ON evaluations_v2 FOR ALL TO anon USING (true) WITH CHECK (true);
```

### 3. 講師・生徒登録

**システム内で簡単登録:**

システムにアクセス後、以下の手順で登録:

1. **講師登録**: 
   - `http://localhost:3000/`でトップページにアクセス
   - 「新しい講師を登録」ボタンをクリック
   - 名前とメールアドレスを入力して登録
   - 登録後、講師を選択してシステムにログイン

2. **生徒登録**: 
   - 講師でログイン後、生徒選択画面で「新しい生徒を登録」ボタンをクリック
   - 名前、メールアドレス（任意）、学年（任意）を入力して登録
   - 登録後、すぐに評価対象として選択可能

3. **動画レコード登録**:
   - 生徒選択後、「新しい動画レコードを登録」ボタンをクリック
   - 楽曲ID、楽曲タイトル、録音日付を入力して登録
   - 登録後、すぐに評価対象として選択可能

### 4. システム利用

**評価の流れ:**
1. 講師を選択してシステムにログイン
2. 評価対象の生徒を選択
3. 生徒の採点対象動画を選択（楽曲・録音日付）
4. 4項目（音程・リズム・表現・テクニック）を10点満点で評価
5. 各項目にコメントを入力（任意）
6. 「評価を送信」でデータベースに保存
7. 自動的にn8nへWebhook送信でレポート生成開始

## 🛠️ 開発環境とテスト

### 接続テスト
システムの接続状況を確認:
```bash
# 開発サーバー起動後
http://localhost:3000/test
```

### 主要なエンドポイント
- **メインページ**: `http://localhost:3000/` - 評価システムのメイン画面
- **テストページ**: `http://localhost:3000/test` - 接続テストとデバッグ

## 🔧 トラブルシューティング

### よくある問題と解決方法

**問題**: 講師・生徒登録時に「new row violates row-level security policy」エラー
→ **解決**: 上記RLSポリシーを設定してください

**問題**: 接続テストでエラーが発生
→ **解決**: 環境変数の設定を確認し、Supabaseプロジェクトの設定を見直してください

**問題**: n8n Webhookでエラーが発生
→ **解決**: 開発環境では自動的にシミュレート処理されます。本番環境のWebhook URLを確認してください

### 技術仕様

- **データベース**: PostgreSQL (Supabase)
  - `instructors` テーブル: 講師情報
  - `students` テーブル: 生徒情報  
  - `video_records` テーブル: 採点対象動画レコード
  - `evaluations_v2` テーブル: 評価データ（個別カラム構造）
- **状態管理**: Zustand with persistence
- **API層**: Supabase Client with TypeScript
- **UI**: Tailwind CSS + Recharts
- **外部連携**: n8n Webhook for report generation

## 🎵 採点対象動画レコード管理

### 機能概要
生徒が歌った楽曲の録音データを管理し、評価対象として選択できる機能です。

### 動画レコード構造
- **楽曲ID**: 楽曲を識別するID
- **楽曲タイトル**: 楽曲の名称
- **録音日付**: 録音した日付
- **生徒との関連**: 特定の生徒に紐づけられた動画レコード

### 利用シーン
1. 生徒が複数の楽曲を録音している場合
2. 同じ楽曲を複数回録音している場合
3. 日付別に評価を管理したい場合

## 🔍 検索型選択UI

### 機能概要
講師選択と生徒選択において、type-ahead（先行入力）形式での検索・選択機能を提供します。

### 検索機能
- **部分一致検索**: 苗字、名前、メールアドレスでの検索
- **リアルタイム検索**: 入力と同時に候補を絞り込み
- **デバウンス機能**: 検索パフォーマンスの最適化

### UI仕様
- 入力フィールドでの検索
- ドロップダウンでの候補表示
- キーボード操作対応（矢印キー、Enter）

## ✅ 登録内容確認機能

### 機能概要
新規登録時に入力内容を確認できる確認画面を表示します。

### 確認対象
- 講師登録内容
- 生徒登録内容
- 動画レコード登録内容

### 確認画面構成
- 入力内容の表示
- 修正ボタン（前の画面に戻る）
- 確定ボタン（登録実行）

## ✏️ 編集機能

### 機能概要
登録済みの情報を後から編集・更新できる機能です。

### 編集対象
- 生徒情報の編集
- 動画レコード情報の編集

### 編集画面構成
- 既存情報の表示
- 編集フォーム
- 保存・キャンセル機能