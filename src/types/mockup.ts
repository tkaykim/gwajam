export type FrontLayerKey =
  | "front_body"
  | "front_sleeves"
  | "front_ribbing"
  | "front_lining"
  | "front_buttons";
export type BackLayerKey = "back_ribbing" | "back_body" | "back_sleeves";

/** 인쇄 영역 8개 (목업 패치 레이어 + 사용자 면/테두리/내용) */
export type PrintAreaKey =
  | "front_left_chest"
  | "front_right_chest"
  | "front_left_sleeve"
  | "front_right_sleeve"
  | "back_top"
  | "back_top2"
  | "back_mid"
  | "back_bottom";

/** 인쇄 영역별 테두리 전용 레이어 키 (관리자에서 업로드) */
export type BorderLayerKey = `${PrintAreaKey}_border`;

export type LayerKey = FrontLayerKey | BackLayerKey | PrintAreaKey | BorderLayerKey;

export interface FrontColors {
  front_body?: string;
  front_sleeves?: string;
  front_ribbing?: string;
  front_lining?: string;
  front_buttons?: string;
}

export interface BackColors {
  back_body?: string;
  back_sleeves?: string;
}

export interface MockupImageRow {
  id: string;
  created_at: string;
  updated_at: string;
  layer_key: LayerKey;
  image_url: string;
  label: string | null;
}

export type MemoSectionKey =
  | "front_left_chest"
  | "front_right_chest"
  | "front_left_sleeve"
  | "front_right_sleeve"
  | "back_top"
  | "back_top2"
  | "back_mid"
  | "back_bottom";

export interface MemoSection {
  text: string | null;
  imageUrl: string | null;
}

/** 인쇄 영역별 상태: 있음/없음, 면 색, 테두리 색, 내용 (null = 색없음) */
export interface PrintAreaState {
  visible: boolean;
  faceColor: string | null;
  borderColor: string | null;
  text: string | null;
  imageUrl: string | null;
}

export interface InquiryPayload {
  front_colors: FrontColors;
  back_colors: BackColors;
  /** 인쇄 영역 8개 상태 (있음/없음, 면색, 테두리색, 텍스트, 이미지) */
  print_areas?: Record<PrintAreaKey, PrintAreaStatePayload>;
  front_left_chest_text: string | null;
  front_left_chest_image_url: string | null;
  front_right_chest_text: string | null;
  front_right_chest_image_url: string | null;
  front_left_sleeve_text: string | null;
  front_left_sleeve_image_url: string | null;
  front_right_sleeve_text: string | null;
  front_right_sleeve_image_url: string | null;
  back_top_text: string | null;
  back_top_image_url: string | null;
  back_mid_text: string | null;
  back_mid_image_url: string | null;
  back_bottom_text: string | null;
  back_bottom_image_url: string | null;
  group_name: string;
  representative_name: string;
  contact: string;
  /** 이메일 (선택) */
  email?: string | null;
  quantity: number;
  quantity_note: string | null;
  /** 수령 희망일 (YYYY-MM-DD) */
  desired_delivery_date: string | null;
  /** 부가설명 텍스트 */
  additional_note_text: string | null;
  /** 부가설명 이미지 URL */
  additional_note_image_url: string | null;
  lining_oz: 0 | 2 | 4;
}

/** API/DB용 인쇄 영역 상태 (snake_case, null = 색없음) */
export interface PrintAreaStatePayload {
  visible: boolean;
  face_color: string | null;
  border_color: string | null;
  text: string | null;
  image_url: string | null;
}

export interface InquiryRow extends InquiryPayload {
  id: string;
  created_at: string;
  admin_memo: string | null;
  status: "pending" | "contacted" | "done";
}
