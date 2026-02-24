import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: post, error: postError } = await supabase
    .from("inquiry_board_posts")
    .select("id, title, author_name, contact, description, image_url, created_at, updated_at")
    .eq("id", id)
    .single();

  if (postError || !post) {
    return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
  }

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
