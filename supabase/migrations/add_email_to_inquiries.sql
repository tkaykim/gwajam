-- 제작문의 이메일(선택) 컬럼 추가
-- Supabase 대시보드 SQL Editor 또는 MCP apply_migration으로 실행하세요.

ALTER TABLE inquiries
ADD COLUMN IF NOT EXISTS email text DEFAULT NULL;

COMMENT ON COLUMN inquiries.email IS '제출자 이메일 (선택)';
