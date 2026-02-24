"use client";

import { useEffect } from "react";

interface BottomDrawerProps {
  /** 드로어 열림 여부 */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 현재 스텝 제목 (바에 표시) */
  title: string;
  /** 스텝 표시 (예: 3/14) */
  stepLabel: string;
  children: React.ReactNode;
  /** 바만 보일 때 높이(px). 기본 48 */
  barHeight?: number;
  /** 열렸을 때 최대 높이. 기본 55vh */
  maxHeight?: string;
}

export function BottomDrawer({
  open,
  onOpenChange,
  title,
  stepLabel,
  children,
  barHeight = 48,
  maxHeight = "55vh",
}: BottomDrawerProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  return (
    <>
      {/* 백드롭: 열렸을 때만 터치로 닫기 */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/20"
          aria-label="드로어 닫기"
          onClick={() => onOpenChange(false)}
        />
      )}
      <div
        className="fixed left-0 right-0 bottom-0 z-50 flex flex-col bg-background border-t border-border rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-[height,max-height] duration-300 ease-out"
        style={{
          maxHeight: open ? maxHeight : `${barHeight}px`,
          height: open ? maxHeight : `${barHeight}px`,
        }}
      >
        {/* 항상 보이는 바: 탭하면 열림/닫힘 */}
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          className="flex items-center justify-between gap-3 px-4 py-2.5 flex-shrink-0 touch-manipulation rounded-t-2xl"
          style={{ minHeight: barHeight }}
          aria-expanded={open}
        >
          <span className="text-sm font-medium text-foreground truncate">{title}</span>
          <span className="text-muted-foreground text-xs tabular-nums flex-shrink-0">{stepLabel}</span>
          <svg
            className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {/* 핸들 (열렸을 때만) */}
        {open && (
          <div className="flex justify-center flex-shrink-0 pb-1">
            <span className="w-10 h-1 rounded-full bg-muted-foreground/30" aria-hidden />
          </div>
        )}
        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-0 min-h-0">
          {children}
        </div>
      </div>
    </>
  );
}
