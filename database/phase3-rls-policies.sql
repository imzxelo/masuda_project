-- Phase 3: 認証ベースのRLSポリシー作成・更新
-- Supabase Dashboard → SQL Editor で実行してください

-- =========================================
-- 1. 古い一時的なポリシーを削除
-- =========================================

DROP POLICY IF EXISTS "Allow authenticated access on instructors" ON instructors;
DROP POLICY IF EXISTS "Allow authenticated access on students" ON students;
DROP POLICY IF EXISTS "Allow authenticated access on video_records" ON video_records;
DROP POLICY IF EXISTS "Allow authenticated access on evaluations_v2" ON evaluations_v2;

-- =========================================
-- 2. 新しい認証ベースのポリシーを作成
-- =========================================

-- 講師テーブル: 自分のレコードのみアクセス可能
CREATE POLICY "instructors_policy" ON instructors
FOR ALL TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- 生徒テーブル: すべての講師がアクセス可能（講師が生徒を管理）
CREATE POLICY "students_policy" ON students
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM instructors 
    WHERE auth_user_id = auth.uid() AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM instructors 
    WHERE auth_user_id = auth.uid() AND is_active = true
  )
);

-- 動画レコードテーブル: すべての講師がアクセス可能
CREATE POLICY "video_records_policy" ON video_records
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM instructors 
    WHERE auth_user_id = auth.uid() AND is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM instructors 
    WHERE auth_user_id = auth.uid() AND is_active = true
  )
);

-- 評価テーブル: 自分が作成した評価のみアクセス可能
CREATE POLICY "evaluations_policy" ON evaluations_v2
FOR ALL TO authenticated
USING (
  instructor_id IN (
    SELECT id FROM instructors 
    WHERE auth_user_id = auth.uid() AND is_active = true
  )
)
WITH CHECK (
  instructor_id IN (
    SELECT id FROM instructors 
    WHERE auth_user_id = auth.uid() AND is_active = true
  )
);

-- =========================================
-- 3. 匿名アクセスポリシーを無効化（セキュリティ強化）
-- =========================================

-- 既存の匿名アクセスポリシーを削除
DROP POLICY IF EXISTS "Allow anonymous access on instructors" ON instructors;
DROP POLICY IF EXISTS "Allow anonymous access on students" ON students;
DROP POLICY IF EXISTS "Allow anonymous access on video_records" ON video_records;
DROP POLICY IF EXISTS "Allow anonymous access on evaluations_v2" ON evaluations_v2;

-- =========================================
-- 4. 設定確認用クエリ
-- =========================================

-- ポリシー一覧表示
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 講師テーブル構造確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'instructors' AND table_schema = 'public'
ORDER BY ordinal_position;