"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Post = {
  id: string;
  title: string;
  author_name: string;
  contact: string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  is_private?: boolean;
};

type Reply = {
  id: string;
  post_id: string;
  is_admin: boolean;
  content: string;
  created_at: string;
};

export default function InquiryBoardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [replyPassword, setReplyPassword] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [viewPassword, setViewPassword] = useState("");
  const [viewPasswordError, setViewPasswordError] = useState("");
  const [viewPasswordLoading, setViewPasswordLoading] = useState(false);

  const isLocked = post?.is_private && (post?.description === null && post?.contact === null);

  const loadWithPassword = async (pwd: string) => {
    setViewPasswordError("");
    setViewPasswordLoading(true);
    try {
      const res = await fetch(`/api/inquiry-board/${id}?password=${encodeURIComponent(pwd)}`);
      if (!res.ok) {
        setViewPasswordError("글을 불러오지 못했습니다.");
        return;
      }
      const data = await res.json();
      if (data.post.is_private && !data.post.description && !data.post.contact) {
        setViewPasswordError("비밀번호가 일치하지 않습니다.");
        return;
      }
      setPost(data.post);
      setReplies(data.replies || []);
    } catch {
      setViewPasswordError("네트워크 오류가 발생했습니다.");
    } finally {
      setViewPasswordLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/inquiry-board/${id}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      setPost(data.post);
      setReplies(data.replies || []);
    })();
  }, [id]);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    setReplyError("");
    if (!replyContent.trim()) return;
    setReplyLoading(true);
    try {
      const res = await fetch(`/api/inquiry-board/${id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyContent.trim(),
          password: replyPassword.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReplyError(data.error || "등록에 실패했습니다.");
        return;
      }
      setReplies((prev) => [...prev, data]);
      setReplyContent("");
      setReplyPassword("");
    } catch {
      setReplyError("네트워크 오류가 발생했습니다.");
    } finally {
      setReplyLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-dvh bg-background p-4">
        <p className="text-muted-foreground text-sm">로딩 중…</p>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-dvh bg-background p-4">
        <p className="text-muted-foreground text-sm">글을 찾을 수 없습니다.</p>
        <Link href="/inquiry-board" className="mt-2 inline-block text-primary">
          목록으로
        </Link>
      </main>
    );
  }

  if (isLocked) {
    return (
      <main className="min-h-dvh bg-background pb-24">
        <header className="sticky top-0 z-10 border-b border-border bg-background/98 px-4 py-3">
          <Link href="/inquiry-board" className="text-lg font-bold text-foreground">
            ← 문의 상세
          </Link>
        </header>
        <div className="p-4">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <h1 className="text-lg font-bold text-foreground">{post.title}</h1>
              <p className="text-sm text-muted-foreground">
                {post.author_name} · {new Date(post.created_at).toLocaleString("ko-KR")}
              </p>
              <p className="text-sm text-muted-foreground">
                비공개 글입니다. 내용을 보려면 비밀번호를 입력하세요.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (viewPassword.trim()) loadWithPassword(viewPassword.trim());
                }}
                className="space-y-2"
              >
                {viewPasswordError && (
                  <p className="text-sm text-destructive">{viewPasswordError}</p>
                )}
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={viewPassword}
                    onChange={(e) => setViewPassword(e.target.value)}
                    placeholder="비밀번호"
                    className="flex-1"
                  />
                  <Button type="submit" disabled={viewPasswordLoading}>
                    {viewPasswordLoading ? "확인 중…" : "확인"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background pb-32">
      <header className="sticky top-0 z-10 border-b border-border bg-background/98 px-4 py-3">
        <Link href="/inquiry-board" className="text-lg font-bold text-foreground">
          ← 문의 상세
        </Link>
      </header>
      <div className="p-4 space-y-4">
        <Card>
          <CardContent className="pt-4 space-y-2">
            <h1 className="text-lg font-bold text-foreground">{post.title}</h1>
            <p className="text-sm text-muted-foreground">
              {post.author_name} · {new Date(post.created_at).toLocaleString("ko-KR")}
            </p>
            {post.description && (
              <p className="whitespace-pre-wrap text-sm text-foreground">{post.description}</p>
            )}
            {post.image_url && (
              <div className="pt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.image_url}
                  alt="첨부"
                  className="max-h-64 rounded-lg object-contain"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <section>
          <h2 className="mb-2 font-semibold text-foreground">댓글 · 답변 ({replies.length})</h2>
          <ul className="space-y-2">
            {replies.map((r) => (
              <li
                key={r.id}
                className={`rounded-xl border p-3 ${
                  r.is_admin ? "border-primary/30 bg-primary/5" : "border-border bg-card"
                }`}
              >
                <p className="text-xs text-muted-foreground">
                  {r.is_admin ? "관리자" : "글쓴이"} ·{" "}
                  {new Date(r.created_at).toLocaleString("ko-KR")}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">{r.content}</p>
              </li>
            ))}
          </ul>
        </section>

        <form onSubmit={handleSubmitReply} className="space-y-2">
          {replyError && (
            <p className="text-sm text-destructive">{replyError}</p>
          )}
          <Label htmlFor="replyContent">댓글 작성</Label>
          <textarea
            id="replyContent"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="댓글을 입력하세요 (글쓴이 추가 문의 시 비밀번호 입력)"
            rows={3}
            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
          />
          <div className="flex gap-2">
            <Input
              type="password"
              value={replyPassword}
              onChange={(e) => setReplyPassword(e.target.value)}
              placeholder="비밀번호 (글쓴이일 때)"
              className="flex-1"
            />
            <Button type="submit" disabled={replyLoading}>
              {replyLoading ? "등록 중…" : "등록"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
