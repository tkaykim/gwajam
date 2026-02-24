"use client";

import { useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import type { PrintAreaKey, PrintAreaState } from "@/types/mockup";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PRESETS = [
  { name: "흰색", hex: "#ffffff" },
  { name: "검정", hex: "#1a1a1a" },
  { name: "파랑", hex: "#2563eb" },
  { name: "네이비", hex: "#1e3a5f" },
  { name: "빨강", hex: "#dc2626" },
  { name: "초록", hex: "#22c55e" },
] as const;

const PRINT_AREA_LABELS: Record<PrintAreaKey, string> = {
  front_left_chest: "앞면 왼쪽 가슴",
  front_right_chest: "앞면 오른쪽 가슴",
  front_left_sleeve: "왼팔뚝",
  front_right_sleeve: "오른팔뚝",
  back_top: "뒷면 상단",
  back_top2: "뒷면 상단2",
  back_mid: "뒷면 중단",
  back_bottom: "뒷면 하단",
};

const PRINT_AREA_ORDER: PrintAreaKey[] = [
  "front_left_chest",
  "front_right_chest",
  "front_left_sleeve",
  "front_right_sleeve",
  "back_top",
  "back_top2",
  "back_mid",
  "back_bottom",
];

/** 앞면 4곳 선택 시 앞면만 크게 보여줄 때 사용 */
export const FRONT_PRINT_KEYS: PrintAreaKey[] = [
  "front_left_chest",
  "front_right_chest",
  "front_left_sleeve",
  "front_right_sleeve",
];
/** 뒷면 4곳 선택 시 뒷면만 크게 보여줄 때 사용 */
export const BACK_PRINT_KEYS: PrintAreaKey[] = [
  "back_top",
  "back_top2",
  "back_mid",
  "back_bottom",
];

/** 앞면 인쇄 영역별 안내 팁 (부담 없이 작게 표시) */
const FRONT_PRINT_TIPS: Partial<Record<PrintAreaKey, string>> = {
  front_left_chest: "일반적으로 학교나 단체명의 영문 첫글자를 기입합니다.",
  front_right_chest: "일반적으로 로고나 이미지를 기입합니다.",
  front_left_sleeve: "일반적으로 로고나 이미지를 기입합니다.",
  front_right_sleeve: "일반적으로 학번이나 숫자를 기입합니다.",
};

/** 뒷면 인쇄 영역별 안내 팁 (부담 없이 작게 표시) */
const BACK_PRINT_TIPS: Partial<Record<PrintAreaKey, string>> = {
  back_top: "일반적으로 학교이름을 기입합니다.",
  back_top2: "일반적으로 UNIV.나 University를 기입합니다.",
  back_mid: "일반적으로 학교로고, 원하는 그래픽이미지가 자수로 들어갑니다.",
  back_bottom: "일반적으로 전공명이나, since 2022등의 필기체 문구가 들어갑니다.",
};

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null;
  onChange: (hex: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const isNone = value == null || value === "";
  const isPreset = !isNone && PRESETS.some((p) => p.hex.toLowerCase() === value.toLowerCase());
  const displayLabel = isNone ? "색없음" : isPreset ? PRESETS.find((p) => p.hex.toLowerCase() === value?.toLowerCase())?.name ?? "기타" : "기타";

  return (
    <div className="space-y-1.5 relative">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`inline-flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-1.5 text-sm font-medium transition shrink-0 ${
            open ? "border-primary ring-1 ring-primary" : "border-border hover:border-primary/50"
          }`}
        >
          {isNone ? (
            <span className="text-muted-foreground">색없음</span>
          ) : (
            <span
              className="w-5 h-5 rounded border border-border shrink-0"
              style={{ backgroundColor: value ?? undefined }}
            />
          )}
          <span className="text-foreground">{displayLabel}</span>
          <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
          </svg>
        </button>
      </div>
      {open && (
        <>
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border">
            {PRESETS.map((p) => (
              <button
                key={p.hex}
                type="button"
                onClick={() => {
                  onChange(p.hex);
                  setShowPicker(false);
                }}
                className={`w-7 h-7 rounded-md border-2 shrink-0 transition ${
                  !isNone && value?.toLowerCase() === p.hex.toLowerCase()
                    ? "border-primary ring-1 ring-primary"
                    : "border-border hover:border-primary/50"
                }`}
                style={{ backgroundColor: p.hex }}
                title={p.name}
              />
            ))}
            <Button
              type="button"
              variant={showPicker || (!isNone && !isPreset) ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => setShowPicker((o) => !o)}
            >
              기타
            </Button>
            <Button
              type="button"
              variant={isNone ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs px-2"
              onClick={() => {
                onChange(null);
                setShowPicker(false);
              }}
            >
              색없음
            </Button>
          </div>
          {showPicker && (
            <div className="pt-2 border-t border-border space-y-2">
              <HexColorPicker
                color={value || "#333333"}
                onChange={(hex) => onChange(hex)}
                style={{ width: "100%" }}
              />
              <Input
                type="text"
                value={value ?? ""}
                onChange={(e) => onChange(e.target.value || null)}
                placeholder="#000000"
                className="font-mono text-xs h-8"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatusChips({ area }: { area: PrintAreaState }) {
  const hasText = !!area.text?.trim();
  const hasImage = !!area.imageUrl;

  if (hasText && hasImage) {
    return (
      <span className="flex items-center gap-1.5 flex-wrap">
        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          텍스트
        </span>
        <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
          이미지 첨부됨
        </span>
      </span>
    );
  }
  if (hasText) {
    return (
      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        텍스트
      </span>
    );
  }
  if (hasImage) {
    return (
      <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
        이미지 첨부됨
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      없음
    </span>
  );
}

export const DEFAULT_PRINT_AREA_STATE: PrintAreaState = {
  visible: true,
  faceColor: "#ffffff",
  borderColor: "#1a1a1a",
  text: null,
  imageUrl: null,
};

export function getDefaultPrintAreas(): Record<PrintAreaKey, PrintAreaState> {
  const base = { ...DEFAULT_PRINT_AREA_STATE };
  const visibleByKey: Partial<Record<PrintAreaKey, boolean>> = {
    front_left_chest: true,
    front_right_chest: false,
    front_left_sleeve: true,
    front_right_sleeve: true,
  };
  return PRINT_AREA_ORDER.reduce(
    (acc, key) => {
      acc[key] = { ...base, visible: visibleByKey[key] ?? true };
      return acc;
    },
    {} as Record<PrintAreaKey, PrintAreaState>
  );
}

interface Step2MemosProps {
  printAreas: Record<PrintAreaKey, PrintAreaState>;
  onPrintAreasChange: (areas: Record<PrintAreaKey, PrintAreaState>) => void;
  onImageUpload: (section: PrintAreaKey, file: File) => Promise<string | null>;
  /** 'front' = 앞면 4곳만, 'back' = 뒷면 4곳만, 'all' = 8곳 모두 */
  side?: "front" | "back" | "all";
}

export function Step2Memos({
  printAreas,
  onPrintAreasChange,
  onImageUpload,
  side = "all",
}: Step2MemosProps) {
  const order: PrintAreaKey[] =
    side === "front" ? [...FRONT_PRINT_KEYS] : side === "back" ? [...BACK_PRINT_KEYS] : [...PRINT_AREA_ORDER];
  const firstKey = order[0];

  const fileInputRefs = useRef<Record<PrintAreaKey, HTMLInputElement | null>>(
    {} as Record<PrintAreaKey, HTMLInputElement | null>
  );
  const [openSections, setOpenSections] = useState<Record<PrintAreaKey, boolean>>(
    order.reduce((acc, key) => ({ ...acc, [key]: key === firstKey }), {} as Record<PrintAreaKey, boolean>)
  );

  const updateArea = (key: PrintAreaKey, updates: Partial<PrintAreaState>) => {
    onPrintAreasChange({
      ...printAreas,
      [key]: { ...printAreas[key], ...updates } as PrintAreaState,
    });
  };

  const toggleSection = (key: PrintAreaKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFileChange = async (key: PrintAreaKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await onImageUpload(key, file);
    if (url) updateArea(key, { imageUrl: url });
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm whitespace-pre-line">
        {side === "front"
          ? "앞면 인쇄 영역을 설정해 주세요.\n텍스트·이미지를 넣을 수 있습니다.\n이미지가 없는 경우 설명을 남겨주시면 담당자가 찾아 시안 작업을 도와드립니다."
          : side === "back"
            ? "뒷면 인쇄 영역을 설정해 주세요.\n텍스트·이미지를 넣을 수 있습니다.\n이미지가 없는 경우 설명을 남겨주시면 담당자가 찾아 시안 작업을 도와드립니다."
            : "각 위치에 인쇄 영역을 설정해 주세요.\n텍스트·이미지를 넣을 수 있습니다.\n이미지가 없는 경우 설명을 남겨주시면 담당자가 찾아 시안 작업을 도와드립니다."}
      </p>
      <div className="space-y-2">
        {order.map((key) => {
          const area = printAreas[key] ?? DEFAULT_PRINT_AREA_STATE;
          return (
            <Card key={key}>
              <button
                type="button"
                onClick={() => toggleSection(key)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-muted/50 transition-colors rounded-2xl"
              >
                <span className="font-medium text-foreground">{PRINT_AREA_LABELS[key]}</span>
                <span className="flex items-center gap-2 shrink-0">
                  {area.imageUrl && (
                    <img
                      src={area.imageUrl}
                      alt=""
                      className="w-9 h-9 rounded-md object-cover border border-border shrink-0"
                    />
                  )}
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                      area.visible ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {area.visible ? "있음" : "없음"}
                  </span>
                  {area.visible && <StatusChips area={area} />}
                  <svg
                    className={`h-5 w-5 text-muted-foreground transition-transform ${openSections[key] ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              {openSections[key] && (
                <CardContent className="pt-0 pb-4 px-4 space-y-3 border-t border-border">
                  {/* 있음/없음 토글 */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">인쇄</span>
                    <div className="flex rounded-lg border border-input p-0.5 bg-muted/30">
                      <button
                        type="button"
                        onClick={() => updateArea(key, { visible: true })}
                        className={`px-3 py-1.5 text-sm rounded-md transition ${
                          area.visible ? "bg-background shadow text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        있음
                      </button>
                      <button
                        type="button"
                        onClick={() => updateArea(key, { visible: false })}
                        className={`px-3 py-1.5 text-sm rounded-md transition ${
                          !area.visible ? "bg-background shadow text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        없음
                      </button>
                    </div>
                  </div>
                  {area.visible && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <ColorRow
                          label="면 색"
                          value={area.faceColor}
                          onChange={(hex) => updateArea(key, { faceColor: hex })}
                        />
                        <ColorRow
                          label="테두리 색"
                          value={area.borderColor}
                          onChange={(hex) => updateArea(key, { borderColor: hex })}
                        />
                      </div>
                      {side === "front" && FRONT_PRINT_TIPS[key] && (
                        <p className="text-[11px] text-muted-foreground leading-snug">
                          {FRONT_PRINT_TIPS[key]}
                        </p>
                      )}
                      {side === "back" && BACK_PRINT_TIPS[key] && (
                        <p className="text-[11px] text-muted-foreground leading-snug">
                          {BACK_PRINT_TIPS[key]}
                        </p>
                      )}
                      <textarea
                        value={area.text ?? ""}
                        onChange={(e) => updateArea(key, { text: e.target.value || null })}
                        placeholder="쓰일 텍스트, 또는 요청사항을 자유롭게 작성해주세요"
                        rows={2}
                        className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 resize-none"
                      />
                      <div className="flex items-center gap-2 flex-wrap">
                        <input
                          ref={(el) => {
                            fileInputRefs.current[key] = el;
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(key, e)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRefs.current[key]?.click()}
                        >
                          이미지 업로드
                        </Button>
                        {area.imageUrl && (
                          <span className="flex items-center gap-2">
                            <img
                              src={area.imageUrl}
                              alt="업로드 미리보기"
                              className="w-14 h-14 rounded-lg object-cover border border-border shrink-0"
                            />
                            <span className="text-xs text-green-600">업로드됨</span>
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export { PRINT_AREA_LABELS, PRINT_AREA_ORDER };
