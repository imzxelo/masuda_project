-- evaluations_v2テーブルに不足しているカラムを追加

-- sent_to_n8nカラムとsent_to_n8n_atカラムを追加（存在しない場合のみ）
DO $$
BEGIN
    -- sent_to_n8nカラムを追加
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'evaluations_v2' 
                   AND column_name = 'sent_to_n8n') THEN
        ALTER TABLE evaluations_v2 ADD COLUMN sent_to_n8n BOOLEAN DEFAULT false;
    END IF;
    
    -- sent_to_n8n_atカラムを追加
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'evaluations_v2' 
                   AND column_name = 'sent_to_n8n_at') THEN
        ALTER TABLE evaluations_v2 ADD COLUMN sent_to_n8n_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 確認クエリ
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'evaluations_v2' 
AND column_name IN ('sent_to_n8n', 'sent_to_n8n_at')
ORDER BY column_name;