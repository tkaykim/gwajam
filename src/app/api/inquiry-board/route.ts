import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hashPassword } from "@/lib/password";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("inquiry_board_posts")
    .select("id, title, author_name, created_at, password_hash")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const list = (data || []).map((row) => ({
    id: row.id,
    title: row.title,
    author_name: row.author_name,
    created_at: row.created_at,
    is_private: !!row.password_hash,
  }));
  return NextResponse.json(list);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, author_name, contact, description, image_url, password } = body as {
      title?: string;
      author_name?: string;
      contact?: string;
      description?: string;
      image_url?: string | null;
      password?: string;
    };

    if (!title?.trim() || !author_name?.trim() || !contact?.trim()) {
      return NextResponse.json(
        { error: "제목, 이름, 연락처를 입력해 주세요." },
        { status: 400 }
      );
    }

    const password_hash = password?.trim() ? hashPassword(password.trim()) : null;

    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("inquiry_board_posts")
      .insert({
        title: title.trim(),
        author_name: author_name.trim(),
        contact: contact.trim(),
        description: description?.trim() || null,
        image_url: image_url || null,
        password_hash,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ id: data.id });
  } catch {
    return NextResponse.json({ error: "제출 실패" }, { status: 500 });
  }
}
