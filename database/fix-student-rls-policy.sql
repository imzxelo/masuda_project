-- 生徒登録時のRLSエラー修正
-- Supabase Dashboard → SQL Editor で実行してください

-- =========================================
-- 生徒テーブルのRLSポリシー確認
-- =========================================

-- 現在のポリシーを確認
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
-- 生徒テーブルのINSERTポリシーを修正
-- =========================================

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "students_policy" ON students;

-- 新しいポリシーを作成（INSERT時のチェックを緩和）
CREATE POLICY "students_read_policy" ON students
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM instructors 
    WHERE auth_user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "students_insert_policy" ON students
FOR INSERT TO authenticated
WITH CHECK (true);  -- 認証済みユーザーは誰でも生徒を追加可能

CREATE POLICY "students_update_policy" ON students
FOR UPDATE TO authenticated
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

CREATE POLICY "students_delete_policy" ON students
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM instructors 
    WHERE auth_user_id = auth.uid() AND is_active = true
  )
);

-- =========================================
-- 確認クエリ
-- =========================================

-- 更新後のポリシーを確認
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