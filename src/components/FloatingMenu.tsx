"use client";

import { useState } from "react";
import { QuickMenuPanel } from "@/components/QuickMenuPanel";

export function FloatingMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-2">
      {open && <QuickMenuPanel onClose={() => setOpen(false)} />}
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
