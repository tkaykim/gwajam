import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { InquiryPayload } from "@/types/mockup";

/** 기존 문의(드래프트) 업데이트 - 색상·인쇄 정보 등 나중에 수집한 데이터 반영 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "id가 필요합니다." }, { status: 400 });
    }
    const body = (await request.json()) as Partial<InquiryPayload>;
    const {
      group_name,
      representative_name,
      contact,
      email,
      quantity,
      front_colors,
      back_colors,
      print_areas,
      front_left_chest_text,
      front_left_chest_image_url,
      front_right_chest_text,
      front_right_chest_image_url,
      front_left_sleeve_text,
      front_left_sleeve_image_url,
      front_right_sleeve_text,
      front_right_sleeve_image_url,
      back_top_text,
      back_top_image_url,
      back_mid_text,
      back_mid_image_url,
      back_bottom_text,
      back_bottom_image_url,
      quantity_note,
      desired_delivery_date,
      additional_note_text,
      additional_note_image_url,
      lining_oz,
    } = body;

    const supabase = createAdminClient();
    const update: Record<string, unknown> = {};
    if (group_name !== undefined) update.group_name = group_name.trim();
    if (representative_name !== undefined) update.representative_name = representative_name.trim();
    if (contact !== undefined) update.contact = contact.trim();
    if (email !== undefined) update.email = email?.trim() || null;
    if (quantity !== undefined) {
      const qty = Number(quantity);
      update.quantity = Number.isInteger(qty) && qty >= 1 ? qty : 1;
    }
    if (front_colors !== undefined) update.front_colors = front_colors;
    if (back_colors !== undefined) update.back_colors = back_colors;
    if (print_areas !== undefined) update.print_areas = print_areas;
    if (front_left_chest_text !== undefined) update.front_left_chest_text = front_left_chest_text || null;
    if (front_left_chest_image_url !== undefined) update.front_left_chest_image_url = front_left_chest_image_url || null;
    if (front_right_chest_text !== undefined) update.front_right_chest_text = front_right_chest_text || null;
    if (front_right_chest_image_url !== undefined) update.front_right_chest_image_url = front_right_chest_image_url || null;
    if (front_left_sleeve_text !== undefined) update.front_left_sleeve_text = front_left_sleeve_text || null;
    if (front_left_sleeve_image_url !== undefined) update.front_left_sleeve_image_url = front_left_sleeve_image_url || null;
    if (front_right_sleeve_text !== undefined) update.front_right_sleeve_text = front_right_sleeve_text || null;
    if (front_right_sleeve_image_url !== undefined) update.front_right_sleeve_image_url = front_right_sleeve_image_url || null;
    if (back_top_text !== undefined) update.back_top_text = back_top_text || null;
    if (back_top_image_url !== undefined) update.back_top_image_url = back_top_image_url || null;
    if (back_mid_text !== undefined) update.back_mid_text = back_mid_text || null;
    if (back_mid_image_url !== undefined) update.back_mid_image_url = back_mid_image_url || null;
    if (back_bottom_text !== undefined) update.back_bottom_text = back_bottom_text || null;
    if (back_bottom_image_url !== undefined) update.back_bottom_image_url = back_bottom_image_url || null;
    if (quantity_note !== undefined) update.quantity_note = quantity_note || null;
    if (desired_delivery_date !== undefined) update.desired_delivery_date = desired_delivery_date || null;
    if (additional_note_text !== undefined) update.additional_note_text = additional_note_text || null;
    if (additional_note_image_url !== undefined) update.additional_note_image_url = additional_note_image_url || null;
    if (lining_oz !== undefined) update.lining_oz = lining_oz === 0 || lining_oz === 2 ? lining_oz : 4;

    const { error } = await supabase.from("inquiries").update(update).eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "수정 실패" },
      { status: 500 }
    );
  }
}
