-- 包括的なRLS問題修正
-- Supabase Dashboard → SQL Editor で実行してください

-- =========================================
-- 1. 現在のRLS状況を完全に確認
-- =========================================

-- すべてのテーブルのRLS設定
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('students', 'instructors', 'evaluations_v2', 'video_records')
ORDER BY tablename;

-- すべてのポリシー
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
  AND tablename IN ('students', 'instructors', 'evaluations_v2', 'video_records')
ORDER BY tablename, policyname;

-- =========================================
-- 2. すべてのポリシーをクリーンアップ
-- =========================================

-- students テーブル
DROP POLICY IF EXISTS "students_policy" ON students;
DROP POLICY IF EXISTS "students_read_policy" ON students;
DROP POLICY IF EXISTS "students_insert_policy" ON students;
DROP POLICY IF EXISTS "students_update_policy" ON students;
DROP POLICY IF EXISTS "students_delete_policy" ON students;
DROP POLICY IF EXISTS "students_full_access" ON students;
DROP POLICY IF EXISTS "Allow authenticated access on students" ON students;
DROP POLICY IF EXISTS "Allow anonymous access on students" ON students;

-- instructors テーブル
DROP POLICY IF EXISTS "instructors_policy" ON instructors;
DROP POLICY IF EXISTS "Allow authenticated access on instructors" ON instructors;
DROP POLICY IF EXISTS "Allow anonymous access on instructors" ON instructors;

-- evaluations_v2 テーブル
DROP POLICY IF EXISTS "evaluations_policy" ON evaluations_v2;
DROP POLICY IF EXISTS "Allow authenticated access on evaluations_v2" ON evaluations_v2;
DROP POLICY IF EXISTS "Allow anonymous access on evaluations_v2" ON evaluations_v2;

-- video_records テーブル
DROP POLICY IF EXISTS "video_records_policy" ON video_records;
DROP POLICY IF EXISTS "Allow authenticated access on video_records" ON video_records;
DROP POLICY IF EXISTS "Allow anonymous access on video_records" ON video_records;

-- =========================================
-- 3. シンプルで確実なポリシーを作成
-- =========================================

-- 講師テーブル: 自分のレコードのみ
CREATE POLICY "instructors_access" ON instructors
FOR ALL TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- 生徒テーブル: 認証済みユーザー全員がアクセス可能
CREATE POLICY "students_access" ON students
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- 動画レコードテーブル: 認証済みユーザー全員がアクセス可能
CREATE POLICY "video_records_access" ON video_records
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- 評価テーブル: 自分が作成した評価のみ
CREATE POLICY "evaluations_access" ON evaluations_v2
FOR ALL TO authenticated
USING (
  instructor_auth_user_id = auth.uid()
)
WITH CHECK (
  instructor_auth_user_id = auth.uid()
);

-- =========================================
-- 4. RLS設定を確認・有効化
-- =========================================

-- RLSが有効になっていることを確認
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations_v2 ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 5. 最終確認
-- =========================================

-- 新しいポリシー確認
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
  AND tablename IN ('students', 'instructors', 'evaluations_v2', 'video_records')
ORDER BY tablename, policyname;

-- テスト用: 現在のユーザー確認
SELECT 
  auth.uid() as current_user_id,
  (SELECT count(*) FROM instructors WHERE auth_user_id = auth.uid()) as instructor_count;