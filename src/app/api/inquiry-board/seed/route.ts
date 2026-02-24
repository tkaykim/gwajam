import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/password";

const DUMMY_PASSWORD = "1234";

const DUMMY_POSTS = [
  { title: "과잠 제작 문의 합니다", author_name: "김모두", contact: "010-1234-5678", description: "과잠 50벌 제작 문의드립니다. 색상 및 로고 위치 상담 원합니다." },
  { title: "바람막이 제작 문의합니다", author_name: "이유니폼", contact: "010-2345-6789", description: "바람막이 단체 주문 문의합니다. 견적 및 납기 확인 부탁드립니다." },
  { title: "후드티 제작 문의합니다", author_name: "박단체", contact: "010-3456-7890", description: "후드티 30벌 제작 문의드립니다. 프린트 옵션 문의 가능할까요?" },
  { title: "점퍼 제작 문의 드려요", author_name: "정제작", contact: "010-4567-8901", description: "겨울용 점퍼 단체 제작 견적 문의합니다." },
  { title: "조끼 제작 문의 합니다", author_name: "최모두", contact: "010-5678-9012", description: "조끼 100벌 주문 예정입니다. 색상 및 로고 문의드립니다." },
];

export async function POST(request: NextRequest) {
  const adminSecret = request.headers.get("x-admin-secret") ?? request.cookies.get("admin_secret")?.value;
  if (process.env.ADMIN_SECRET && adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServerSupabaseClient();
  const password_hash = hashPassword(DUMMY_PASSWORD);

  for (const p of DUMMY_POSTS) {
    await supabase.from("inquiry_board_posts").insert({
      title: p.title,
      author_name: p.author_name,
      contact: p.contact,
      description: p.description,
      image_url: null,
      password_hash,
    });
  }

  return NextResponse.json({
    ok: true,
    count: DUMMY_POSTS.length,
    message: `비공개 더미 글 ${DUMMY_POSTS.length}건이 추가되었습니다. (비밀번호: ${DUMMY_PASSWORD})`,
  });
}
