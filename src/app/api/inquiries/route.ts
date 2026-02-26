import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { InquiryPayload } from "@/types/mockup";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as InquiryPayload;
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

    if (!group_name?.trim() || !representative_name?.trim() || !contact?.trim()) {
      return NextResponse.json(
        { error: "단체명, 대표자명, 연락처는 필수입니다." },
        { status: 400 }
      );
    }
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      return NextResponse.json(
        { error: "제작 수량은 1 이상의 숫자를 입력해 주세요." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: row, error } = await supabase
      .from("inquiries")
      .insert({
        front_colors: front_colors ?? {},
        back_colors: back_colors ?? {},
        print_areas: print_areas ?? null,
        front_left_chest_text: front_left_chest_text || null,
        front_left_chest_image_url: front_left_chest_image_url || null,
        front_right_chest_text: front_right_chest_text || null,
        front_right_chest_image_url: front_right_chest_image_url || null,
        front_left_sleeve_text: front_left_sleeve_text || null,
        front_left_sleeve_image_url: front_left_sleeve_image_url || null,
        front_right_sleeve_text: front_right_sleeve_text || null,
        front_right_sleeve_image_url: front_right_sleeve_image_url || null,
        back_top_text: back_top_text || null,
        back_top_image_url: back_top_image_url || null,
        back_mid_text: back_mid_text || null,
        back_mid_image_url: back_mid_image_url || null,
        back_bottom_text: back_bottom_text || null,
        back_bottom_image_url: back_bottom_image_url || null,
        group_name: group_name.trim(),
        representative_name: representative_name.trim(),
        contact: contact.trim(),
        email: email?.trim() || null,
        quantity: qty,
        quantity_note: quantity_note || null,
        desired_delivery_date: desired_delivery_date || null,
        additional_note_text: additional_note_text || null,
        additional_note_image_url: additional_note_image_url || null,
        lining_oz: lining_oz === 0 || lining_oz === 2 ? lining_oz : 4,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id: (row as { id: string })?.id ?? null });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "제출 실패" },
      { status: 500 }
    );
  }
}
