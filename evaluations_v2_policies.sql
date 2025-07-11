-- evaluations_v2テーブルのRLSポリシーを設定

-- 既存のポリシーがあれば削除
DROP POLICY IF EXISTS "Allow anonymous insert on evaluations_v2" ON evaluations_v2;
DROP POLICY IF EXISTS "Allow anonymous select on evaluations_v2" ON evaluations_v2;
DROP POLICY IF EXISTS "Allow anonymous update on evaluations_v2" ON evaluations_v2;
DROP POLICY IF EXISTS "Allow anonymous delete on evaluations_v2" ON evaluations_v2;

-- 新しいポリシーを作成（匿名ユーザーに全権限を付与）
CREATE POLICY "Allow anonymous insert on evaluations_v2" 
ON evaluations_v2 FOR INSERT 
TO anon 
WITH CHECK (true);

CREATE POLICY "Allow anonymous select on evaluations_v2" 
ON evaluations_v2 FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow anonymous update on evaluations_v2" 
ON evaluations_v2 FOR UPDATE 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow anonymous delete on evaluations_v2" 
ON evaluations_v2 FOR DELETE 
TO anon 
USING (true);

-- RLSが有効になっているか確認
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'evaluations_v2';

-- もしRLSが無効の場合は有効化
-- ALTER TABLE evaluations_v2 ENABLE ROW LEVEL SECURITY;