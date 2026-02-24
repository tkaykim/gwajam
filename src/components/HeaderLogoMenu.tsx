"use client";

import { useState, useRef, useEffect } from "react";
import { QuickMenuPanel } from "@/components/QuickMenuPanel";

const LOGO_URL = "https://www.modoouniform.com/icons/modoo_logo.png";

interface HeaderLogoMenuProps {
  height?: number;
}

/** 헤더용 로고: 클릭 시 플로팅 메뉴와 동일한 메뉴 패널 표시 */
export function HeaderLogoMenu({ height = 32 }: HeaderLogoMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={open}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_URL}
          alt="모두의 유니폼"
          className="h-8 w-auto"
          style={{ height: `${height}px` }}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 min-w-[200px]">
          <QuickMenuPanel onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
