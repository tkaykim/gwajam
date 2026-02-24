import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/password";

const ADMIN_COOKIE = "admin_secret";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const body = await request.json();
    const { content, password } = body as { content?: string; password?: string };

    if (!content?.trim()) {
      return NextResponse.json({ error: "내용을 입력해 주세요." }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    const adminSecret = request.cookies.get(ADMIN_COOKIE)?.value;
    const isAdmin = !!process.env.ADMIN_SECRET && adminSecret === process.env.ADMIN_SECRET;

    if (!isAdmin) {
      const { data: post } = await supabase
        .from("inquiry_board_posts")
        .select("password_hash")
        .eq("id", postId)
        .single();

      if (!post) {
        return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
      }

      if (post.password_hash) {
        if (!password?.trim()) {
          return NextResponse.json({ error: "비밀번호를 입력해 주세요." }, { status: 400 });
        }
        const hash = hashPassword(password.trim());
        if (hash !== post.password_hash) {
          return NextResponse.json({ error: "비밀번호가 일치하지 않습니다." }, { status: 403 });
        }
      }
    }

    const { data: reply, error } = await supabase
      .from("inquiry_board_replies")
      .insert({
        post_id: postId,
        is_admin: isAdmin,
        content: content.trim(),
      })
      .select("id, is_admin, content, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(reply);
  } catch {
    return NextResponse.json({ error: "등록 실패" }, { status: 500 });
  }
}
