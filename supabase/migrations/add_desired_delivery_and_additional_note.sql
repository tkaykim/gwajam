-- 수령희망일, 부가설명(텍스트·이미지)
-- Supabase SQL Editor에서 실행하세요.

ALTER TABLE inquiries
ADD COLUMN IF NOT EXISTS desired_delivery_date date DEFAULT NULL,
ADD COLUMN IF NOT EXISTS additional_note_text text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS additional_note_image_url text DEFAULT NULL;

COMMENT ON COLUMN inquiries.desired_delivery_date IS '수령 희망일';
COMMENT ON COLUMN inquiries.additional_note_text IS '부가설명 텍스트';
COMMENT ON COLUMN inquiries.additional_note_image_url IS '부가설명 이미지 URL';
