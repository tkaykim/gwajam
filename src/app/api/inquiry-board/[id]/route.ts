import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/password";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const passwordParam = request.nextUrl.searchParams.get("password");
  const supabase = await createServerSupabaseClient();

  const { data: row, error: postError } = await supabase
    .from("inquiry_board_posts")
    .select("id, title, author_name, contact, description, image_url, created_at, updated_at, password_hash")
    .eq("id", id)
    .single();

  if (postError || !row) {
    return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
  }

  const hasPassword = !!row.password_hash;
  const passwordCorrect =
    hasPassword &&
    passwordParam !== null &&
    hashPassword(passwordParam) === row.password_hash;

  if (hasPassword && !passwordCorrect) {
    return NextResponse.json({
      post: {
        id: row.id,
        title: row.title,
        author_name: row.author_name,
        created_at: row.created_at,
        updated_at: row.updated_at,
        description: null,
        contact: null,
        image_url: null,
        is_private: true,
      },
      replies: [],
    });
  }

  const post = {
    id: row.id,
    title: row.title,
    author_name: row.author_name,
    contact: row.contact,
    description: row.description,
    image_url: row.image_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
    ...(hasPassword ? { is_private: false } : {}),
  };

  const { data: replies, error: repliesError } = await supabase
    .from("inquiry_board_replies")
    .select("id, post_id, is_admin, content, created_at")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  if (repliesError) {
    return NextResponse.json({ error: repliesError.message }, { status: 500 });
  }

  return NextResponse.json({
    post,
    replies: replies || [],
  });
}
