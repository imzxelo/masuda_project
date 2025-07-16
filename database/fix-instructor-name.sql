-- 講師名表示問題の修正
-- Supabase Dashboard → SQL Editor で実行してください

-- =========================================
-- 1. 現在の講師データ確認
-- =========================================

-- 講師テーブルの現在の状況
SELECT 
  id,
  name,
  email,
  auth_user_id,
  is_active,
  created_at
FROM instructors
ORDER BY created_at DESC;

-- =========================================
-- 2. auth.usersテーブルからuser_metadataを確認
-- =========================================

-- Supabase Authのユーザーデータ確認
SELECT 
  id,
  email,
  raw_user_meta_data,
  user_metadata,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- =========================================
-- 3. 講師名を正しく更新
-- =========================================

-- 既存の講師の名前が email になっている場合の修正
-- 例: makoto1peace@gmail.com → 適切な講師名に更新

-- この部分は手動で実際の講師名に置き換えてください
UPDATE instructors 
SET name = 'Makoto Masuda'  -- 実際の講師名に変更
WHERE email = 'makoto1peace@gmail.com' 
  AND (name IS NULL OR name = email OR name = 'makoto1peace');

-- =========================================
-- 4. 確認
-- =========================================

-- 更新後の確認
SELECT 
  id,
  name,
  email,
  auth_user_id,
  is_active
FROM instructors
ORDER BY created_at DESC;