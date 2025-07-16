-- video_records テーブルにstudent_nameカラムを追加
-- これにより、n8nでのreport_generations挿入時にJOINが不要になる

ALTER TABLE video_records 
ADD COLUMN student_name TEXT;

-- 既存のレコードにstudent_nameを設定（データマイグレーション）
UPDATE video_records 
SET student_name = students.name 
FROM students 
WHERE video_records.student_id = students.id;

-- 今後のレコードでは、student_nameは必須項目とする
-- （フロントエンドで生徒選択時に自動設定）

-- 確認用クエリ
SELECT 
  vr.id,
  vr.song_title,
  vr.student_name,
  s.name as student_name_from_join,
  vr.recorded_at
FROM video_records vr
LEFT JOIN students s ON vr.student_id = s.id
ORDER BY vr.created_at DESC
LIMIT 10;