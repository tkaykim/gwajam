"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function InquiryBoardWritePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [contact, setContact] = useState("");
  const [description, setDescription] = useState("");
  const [password, setPassword] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.set("file", file);
    form.set("section", "inquiry_board");
    const res = await fetch("/api/upload-memo", { method: "POST", body: form });
    const data = await res.json();
    if (res.ok && data.url) setImageUrl(data.url);
    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !authorName.trim() || !contact.trim()) {
      setError("제목, 이름, 연락처를 입력해 주세요.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/inquiry-board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          author_name: authorName.trim(),
          contact: contact.trim(),
          description: description.trim() || null,
          image_url: imageUrl,
          password: password.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "등록에 실패했습니다.");
        return;
      }
      router.push(`/inquiry-board/${data.id}`);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh bg-background pb-24">
      <header className="sticky top-0 z-10 border-b border-border bg-background/98 px-4 py-3">
        <Link href="/inquiry-board" className="text-lg font-bold text-foreground">
          ← 글쓰기
        </Link>
      </header>
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
          )}
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목 *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorName">이름 *</Label>
                <Input
                  id="authorName"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="이름"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact">연락처 *</Label>
                <Input
                  id="contact"
                  type="tel"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="010-0000-0000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="문의 내용을 입력하세요"
                  rows={4}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label>사진 첨부</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="inquiry-image"
                    onChange={handleImageUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("inquiry-image")?.click()}
                  >
                    이미지 첨부
                  </Button>
                  {imageUrl && <span className="text-xs text-green-600">첨부됨</span>}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호 (수정/추가 문의 시 사용)</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="선택 입력"
                  autoComplete="new-password"
                />
              </div>
            </CardContent>
          </Card>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "등록 중…" : "등록하기"}
          </Button>
        </form>
      </div>
    </main>
  );
}
