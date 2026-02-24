import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = {
  title: "문의게시판 | 단체복 목업",
  description: "문의를 남기거나 답변을 확인하세요.",
};

export default async function InquiryBoardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: posts } = await supabase
    .from("inquiry_board_posts")
    .select("id, title, author_name, created_at")
    .order("created_at", { ascending: false });

  const postsList = posts || [];

  return (
    <main className="min-h-dvh bg-background pb-24">
      <header className="sticky top-0 z-10 border-b border-border bg-background/98 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-foreground">
          ← 문의게시판
        </Link>
      </header>
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">문의게시판</h1>
          <Link
            href="/inquiry-board/write"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            글쓰기
          </Link>
        </div>
        {postsList.length === 0 ? (
          <p className="text-muted-foreground text-sm">등록된 글이 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {postsList.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/inquiry-board/${p.id}`}
                  className="block rounded-xl border border-border bg-card p-4 hover:bg-muted/50"
                >
                  <h2 className="font-medium text-foreground">{p.title}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.author_name} · {new Date(p.created_at).toLocaleDateString("ko-KR")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
