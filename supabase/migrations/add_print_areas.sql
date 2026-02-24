-- 인쇄 영역 8개 상태 저장 (있음/없음, 면색, 테두리색, 텍스트, 이미지)
-- Supabase SQL Editor에서 실행하세요.

ALTER TABLE inquiries
ADD COLUMN IF NOT EXISTS print_areas jsonb DEFAULT NULL;

COMMENT ON COLUMN inquiries.print_areas IS 'Record<PrintAreaKey, { visible, face_color, border_color, text, image_url }>';
