"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";

const ONBOARDING_STORAGE_KEY = "modoo-gwajam-onboarding-seen";

const SUPABASE_STORAGE_BASE =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  `${process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/onboarding`;

function getStepImageUrl(step: number): string {
  const envUrl =
    process.env[`NEXT_PUBLIC_ONBOARDING_STEP${step}_URL` as keyof typeof process.env];
  if (envUrl && typeof envUrl === "string") return envUrl;
  if (SUPABASE_STORAGE_BASE) return `${SUPABASE_STORAGE_BASE}/step${step}.png`;
  return `/onboarding/step${step}.png`;
}

const SLIDES = [
  { title: "색상 지정하고,", image: getStepImageUrl(1) },
  { title: "로고 첨부하고,", image: getStepImageUrl(2) },
  { title: "대략적인 수량만 선택하면", image: getStepImageUrl(3) },
  { title: "견적, 시안 작업을 당일 확인 가능!", image: getStepImageUrl(4) },
];

export function getOnboardingSeen(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(ONBOARDING_STORAGE_KEY);
}

export function setOnboardingSeen(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ONBOARDING_STORAGE_KEY, "1");
}

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleStart = useCallback(() => {
    setOnboardingSeen();
    onComplete();
  }, [onComplete]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i < SLIDES.length - 1 ? i + 1 : i));
  }, []);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : i));
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    },
    [goNext, goPrev]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const slide = SLIDES[currentIndex];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background">
      <div className="flex-1 flex flex-col min-h-0 overflow-auto">
        {/* Step indicator: 점만 동일 크기 */}
        <div className="flex-shrink-0 pt-6 pb-4 px-4">
          <div
            className="flex items-center justify-center gap-2"
            role="tablist"
            aria-label="온보딩 단계"
          >
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === currentIndex}
                aria-label={`${i + 1}단계`}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                  i === currentIndex
                    ? "bg-primary"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Slide: 실제 화면 캡처 + 문구 */}
        <div
          className="flex-1 flex flex-col items-center px-4 pb-4 min-h-0"
          role="tabpanel"
          aria-roledescription="slide"
        >
          <div className="w-full max-w-sm flex flex-col items-center gap-4">
            <div className="w-full rounded-xl border border-border bg-card overflow-hidden shadow-sm ring-1 ring-black/5">
              <div className="relative aspect-[9/19] w-full bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.image}
                  alt=""
                  className="w-full h-full object-cover object-top"
                  loading={currentIndex <= 1 ? "eager" : "lazy"}
                />
              </div>
            </div>
            <div className="text-center w-full">
              <h2 className="text-lg font-bold text-foreground leading-tight">
                {slide.title}
              </h2>
            </div>
          </div>
        </div>

        {/* 이전 / 다음 */}
        {SLIDES.length > 1 && (
          <div className="flex-shrink-0 flex items-center justify-center gap-6 py-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
            >
              이전
            </button>
            <span className="text-xs text-muted-foreground tabular-nums">
              {currentIndex + 1} / {SLIDES.length}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={currentIndex === SLIDES.length - 1}
              className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
            >
              다음
            </button>
          </div>
        )}
      </div>

      {/* 바로 시작하기 */}
      <div className="flex-shrink-0 p-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] bg-background border-t border-border">
        <Button type="button" className="w-full" size="lg" onClick={handleStart}>
          바로 시작하기
        </Button>
      </div>
    </div>
  );
}
