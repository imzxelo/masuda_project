-- 採点対象動画レコードテーブルの作成
CREATE TABLE video_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) NOT NULL,
  song_id TEXT NOT NULL,
  song_title TEXT NOT NULL,
  recorded_at DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成（パフォーマンス向上）
CREATE INDEX idx_video_records_student_id ON video_records(student_id);
CREATE INDEX idx_video_records_recorded_at ON video_records(recorded_at);

-- RLS（Row Level Security）の有効化
ALTER TABLE video_records ENABLE ROW LEVEL SECURITY;

-- 匿名ユーザーにフルアクセス権限を付与（開発環境用）
CREATE POLICY "Allow anonymous access on video_records" 
ON video_records 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

-- 既存のevaluations_v2テーブルにvideo_record_idカラムを追加
ALTER TABLE evaluations_v2 
ADD COLUMN video_record_id UUID REFERENCES video_records(id);

-- 既存のevaluations_v2テーブルのRLSポリシーを更新（必要に応じて）
-- 既存のポリシーがある場合は削除して再作成
DROP POLICY IF EXISTS "Allow anonymous access on evaluations_v2" ON evaluations_v2;
CREATE POLICY "Allow anonymous access on evaluations_v2" 
ON evaluations_v2 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

-- 確認クエリ（実行後に結果を確認）
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'video_records') as policy_count
FROM pg_tables 
WHERE tablename IN ('video_records', 'evaluations_v2');