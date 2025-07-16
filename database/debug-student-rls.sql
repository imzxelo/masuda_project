-- 生徒テーブルRLSポリシーのデバッグ
-- Supabase Dashboard → SQL Editor で実行してください

-- =========================================
-- 1. 現在のRLS設定を確認
-- =========================================

-- テーブルのRLS有効状況
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'students' AND schemaname = 'public';

-- 現在のポリシー一覧
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
WHERE tablename = 'students' AND schemaname = 'public'
ORDER BY policyname;

-- =========================================
-- 2. 認証状況のテスト
-- =========================================

-- 現在のユーザーID確認
SELECT auth.uid() as current_user_id;

-- 講師テーブルのデータ確認
SELECT 
  id,
  name,
  email,
  auth_user_id,
  is_active
FROM instructors
WHERE auth_user_id = auth.uid();

-- =========================================
-- 3. 一時的にRLSを無効化してテスト
-- =========================================

-- 注意: これは一時的なテスト用です
-- ALTER TABLE students DISABLE ROW LEVEL SECURITY;

-- =========================================
-- 4. 修正版ポリシー（完全に無効化）
-- =========================================

-- 既存のポリシーをすべて削除
DROP POLICY IF EXISTS "students_policy" ON students;
DROP POLICY IF EXISTS "students_read_policy" ON students;
DROP POLICY IF EXISTS "students_insert_policy" ON students;
DROP POLICY IF EXISTS "students_update_policy" ON students;
DROP POLICY IF EXISTS "students_delete_policy" ON students;

-- 認証済みユーザーに完全なアクセス権を付与
CREATE POLICY "students_full_access" ON students
FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- =========================================
-- 5. 確認
-- =========================================

-- 更新後のポリシー確認
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
WHERE tablename = 'students' AND schemaname = 'public'
ORDER BY policyname;