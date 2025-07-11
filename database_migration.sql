-- studentsテーブルのgradeカラムをnotesにリネーム
ALTER TABLE students RENAME COLUMN grade TO notes;

-- カラムのコメントも更新
COMMENT ON COLUMN students.notes IS '備考（同姓同名の生徒を識別するために使用）';