"use client";

import Link from "next/link";
import {
  ClipboardList,
  MessageSquare,
  Phone,
  MessageCircle,
  Home,
} from "lucide-react";

const PHONE_NUMBER = "010-8140-0621";
const KAKAO_CHAT_URL = "http://pf.kakao.com/_xjSdYG/chat";
const HOMEPAGE_URL = "https://www.modoouniform.com/home";

export { PHONE_NUMBER, KAKAO_CHAT_URL, HOMEPAGE_URL };

interface QuickMenuPanelProps {
  onClose?: () => void;
  className?: string;
}

const iconSize = 18;

/** 플로팅 메뉴 / 헤더 로고 드롭다운에 공통으로 쓰는 메뉴 목록 */
export function QuickMenuPanel({ onClose, className = "" }: QuickMenuPanelProps) {
  const linkClass =
    "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted";

  return (
    <div
      className={`flex flex-col gap-2 rounded-2xl border border-border bg-background/95 p-2 shadow-lg backdrop-blur ${className}`}
      role="menu"
    >
      <Link href="/cases" className={linkClass} onClick={onClose}>
        <ClipboardList size={iconSize} className="shrink-0" />
        제작사례
      </Link>
      <Link href="/inquiry-board" className={linkClass} onClick={onClose}>
        <MessageSquare size={iconSize} className="shrink-0" />
        문의게시판
      </Link>
      <a href={`tel:${PHONE_NUMBER.replace(/-/g, "")}`} className={linkClass} onClick={onClose}>
        <Phone size={iconSize} className="shrink-0" />
        전화 안내
      </a>
      <a
        href={KAKAO_CHAT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        onClick={onClose}
      >
        <MessageCircle size={iconSize} className="shrink-0" />
        카톡상담
      </a>
      <a
        href={HOMEPAGE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        onClick={onClose}
      >
        <Home size={iconSize} className="shrink-0" />
        홈페이지로 이동
      </a>
    </div>
  );
}
