"use client";

import { useState } from "react";
import Link from "next/link";

const PHONE_NUMBER = "010-8140-0621";
const KAKAO_CHAT_URL = "http://pf.kakao.com/_xjSdYG/chat";

export function FloatingMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-background/95 p-2 shadow-lg backdrop-blur">
          <Link
            href="/cases"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            <span className="text-base">📋</span>
            제작사례
          </Link>
          <Link
            href="/inquiry-board"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            <span className="text-base">💬</span>
            문의게시판
          </Link>
          <a
            href={`tel:${PHONE_NUMBER.replace(/-/g, "")}`}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            <span className="text-base">📞</span>
            전화 안내
          </a>
          <a
            href={KAKAO_CHAT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
          >
            <span className="text-base">💛</span>
            카톡상담
          </a>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl text-white shadow-lg transition hover:bg-primary/90"
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
      >
        {open ? "✕" : "☰"}
      </button>
    </div>
  );
}
