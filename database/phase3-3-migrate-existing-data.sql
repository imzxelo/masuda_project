-- Phase 3-3: 既存データの講師アカウント紐付け移行
-- Supabase Dashboard → SQL Editor で実行してください

-- =========================================
-- 1. 現在の状況確認
-- =========================================

-- 既存の講師データ確認
SELECT 
  id, 
  name, 
  email, 
  auth_user_id,
  is_active,
  created_at
FROM instructors 
ORDER BY created_at;

-- 既存の評価データ確認（instructor_auth_user_id が NULL のもの）
SELECT 
  id,
  instructor_id,
  instructor_auth_user_id,
  student_id,
  created_at
FROM evaluations_v2 
WHERE instructor_auth_user_id IS NULL
ORDER BY created_at DESC
LIMIT 10;

-- =========================================
-- 2. 既存評価データの移行
-- =========================================

-- 既存の評価データに instructor_auth_user_id を設定
-- instructors テーブルから auth_user_id を取得して更新
UPDATE evaluations_v2 
SET instructor_auth_user_id = instructors.auth_user_id
FROM instructors
WHERE evaluations_v2.instructor_id = instructors.id
  AND evaluations_v2.instructor_auth_user_id IS NULL
  AND instructors.auth_user_id IS NOT NULL;

-- =========================================
-- 3. 移行結果の確認
-- =========================================

-- 移行後の状況確認
SELECT 
  COUNT(*) as total_evaluations,
  COUNT(instructor_auth_user_id) as with_auth_user_id,
  COUNT(*) - COUNT(instructor_auth_user_id) as missing_auth_user_id
FROM evaluations_v2;

-- 講師別の評価データ確認
SELECT 
  i.name as instructor_name,
  i.email,
  i.auth_user_id,
  COUNT(e.id) as evaluation_count
FROM instructors i
LEFT JOIN evaluations_v2 e ON i.id = e.instructor_id
WHERE i.is_active = true
GROUP BY i.id, i.name, i.email, i.auth_user_id
ORDER BY evaluation_count DESC;

-- instructor_auth_user_id が設定されていない評価データがあるかチェック
SELECT 
  e.id,
  e.instructor_id,
  i.name as instructor_name,
  i.auth_user_id,
  e.created_at
FROM evaluations_v2 e
LEFT JOIN instructors i ON e.instructor_id = i.id
WHERE e.instructor_auth_user_id IS NULL
ORDER BY e.created_at DESC;

-- =========================================
-- 4. 孤立したデータの対応（必要に応じて）
-- =========================================

-- auth_user_id が NULL の講師がいる場合の確認
SELECT 
  id,
  name,
  email,
  auth_user_id,
  created_at
FROM instructors 
WHERE auth_user_id IS NULL
ORDER BY created_at;

-- 注意: auth_user_id が NULL の講師は新しい認証システムでアクセスできません
-- 必要に応じて手動でSupabase Authアカウントを作成し、auth_user_idを設定してください