"use client";

import { useState, useCallback } from "react";
import { HexColorPicker } from "react-colorful";
import type { FrontColors, BackColors } from "@/types/mockup";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BODY_PRESETS = [
  { name: "검정", hex: "#1a1a1a" },
  { name: "흰색", hex: "#ffffff" },
  { name: "파랑", hex: "#2563eb" },
  { name: "네이비", hex: "#1e3a5f" },
  { name: "연초록", hex: "#86efac" },
  { name: "초록", hex: "#22c55e" },
  { name: "빨강", hex: "#dc2626" },
  { name: "버건디", hex: "#722f37" },
  { name: "크림슨레드", hex: "#dc143c" },
  { name: "하늘색", hex: "#0ea5e9" },
  { name: "핑크", hex: "#ec4899" },
] as const;

export const BODY_PRESETS_READONLY = BODY_PRESETS;
const SLEEVE_BUTTON_PRESETS = [
  { name: "흰색", hex: "#ffffff" },
  { name: "검정", hex: "#1a1a1a" },
] as const;
export const SLEEVE_BUTTON_PRESETS_READONLY = SLEEVE_BUTTON_PRESETS;

const LINING_OZ_OPTIONS = [0, 2, 4] as const;
export type LiningOz = (typeof LINING_OZ_OPTIONS)[number];
export const LINING_OZ_OPTIONS_READONLY = LINING_OZ_OPTIONS;

const DEFAULT_BODY = "#1a1a1a";
const DEFAULT_SLEEVE = "#ffffff";
const DEFAULT_BUTTON = "#ffffff";
const LINING_COLOR = "#1a1a1a";

export const DEFAULT_COLORS: FrontColors & BackColors = {
  front_body: DEFAULT_BODY,
  back_body: DEFAULT_BODY,
  front_sleeves: DEFAULT_SLEEVE,
  back_sleeves: DEFAULT_SLEEVE,
  front_ribbing: "#ffffff",
  front_lining: LINING_COLOR,
  front_buttons: DEFAULT_BUTTON,
};

interface Step1ColorsProps {
  frontColors: FrontColors;
  backColors: BackColors;
  liningOz: LiningOz;
  onFrontColorsChange: (c: FrontColors) => void;
  onBackColorsChange: (c: BackColors) => void;
  onLiningOzChange: (oz: LiningOz) => void;
}

type OpenKey = "body" | "sleeve" | "ribbing" | "button" | null;

function ColorChipButton({
  label,
  value,
  isOpen,
  onClick,
  presets,
}: {
  label: string;
  value: string | undefined;
  isOpen: boolean;
  onClick: () => void;
  presets: readonly { name: string; hex: string }[];
}) {
  const isNone = value == null || value === "";
  const isPreset = !isNone && presets.some((p) => p.hex.toLowerCase() === value?.toLowerCase());
  const displayLabel = isNone
    ? "색없음"
    : isPreset
      ? presets.find((p) => p.hex.toLowerCase() === value?.toLowerCase())?.name ?? "기타"
      : "기타";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-medium transition shrink-0 ${
        isOpen ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"
      }`}
    >
      <span className="text-muted-foreground text-sm whitespace-nowrap">{label}</span>
      {isNone ? (
        <span className="text-muted-foreground text-sm">색없음</span>
      ) : (
        <span
          className="w-5 h-5 rounded-md border border-border shrink-0"
          style={{ backgroundColor: value ?? undefined }}
        />
      )}
      <span className="text-foreground text-sm min-w-[2rem] text-left">{displayLabel}</span>
      <svg className="h-4 w-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
      </svg>
    </button>
  );
}

function ExpandPanel({
  openKey,
  presets,
  value,
  onChange,
  extraButtons,
  showOther,
}: {
  openKey: OpenKey;
  onClose?: () => void;
  presets: readonly { name: string; hex: string }[];
  value: string | undefined;
  onChange: (hex: string | undefined) => void;
  extraButtons?: { label: string; onClick: () => void }[];
  showOther?: boolean;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const isNone = value == null || value === "";
  const isPreset = !isNone && presets.some((p) => p.hex.toLowerCase() === value?.toLowerCase());

  if (!openKey) return null;

  return (
    <div className="pt-5 mt-5 border-t border-border/60 space-y-4">
      <div className="flex flex-wrap gap-2.5 items-center">
        {presets.map((p) => (
          <button
            key={p.hex}
            type="button"
            onClick={() => { onChange(p.hex); setShowPicker(false); }}
            className={`w-10 h-10 rounded-lg border-2 shrink-0 transition ${
              !isNone && value?.toLowerCase() === p.hex.toLowerCase()
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/40"
            }`}
            style={{ backgroundColor: p.hex }}
            title={p.name}
          />
        ))}
        {extraButtons?.map((b) => (
          <Button key={b.label} type="button" variant="outline" size="sm" className="h-9 px-3 text-sm" onClick={() => { b.onClick(); setShowPicker(false); }}>
            {b.label}
          </Button>
        ))}
        {showOther && (
          <>
            <Button
              type="button"
              variant={showPicker || (!isNone && !isPreset) ? "default" : "outline"}
              size="sm"
              className="h-9 px-3 text-sm"
              onClick={() => setShowPicker((o) => !o)}
            >
              기타
            </Button>
            <Button
              type="button"
              variant={isNone ? "default" : "outline"}
              size="sm"
              className="h-9 px-3 text-sm"
              onClick={() => { onChange(undefined); setShowPicker(false); }}
            >
              색없음
            </Button>
          </>
        )}
      </div>
      {showOther && showPicker && (
        <div className="space-y-3">
          <HexColorPicker color={value || "#333333"} onChange={onChange} style={{ width: "100%" }} />
          <Input
            type="text"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value || undefined)}
            placeholder="#000000"
            className="font-mono text-sm h-9"
          />
        </div>
      )}
    </div>
  );
}

export type ColorStepKey = "body" | "sleeve" | "ribbing" | "button" | "liningOz";

interface SingleColorStepContentProps {
  colorKey: ColorStepKey;
  frontColors: FrontColors;
  backColors: BackColors;
  liningOz: LiningOz;
  onFrontColorsChange: (c: FrontColors) => void;
  onBackColorsChange: (c: BackColors) => void;
  onLiningOzChange: (oz: LiningOz) => void;
  onNext: () => void;
  /** true면 드로어 푸터에서 이전/다음을 쓰므로 내부 다음 버튼 숨김 */
  hideNextButton?: boolean;
}

export function SingleColorStepContent({
  colorKey,
  frontColors,
  backColors,
  liningOz,
  onFrontColorsChange,
  onBackColorsChange,
  onLiningOzChange,
  onNext,
  hideNextButton,
}: SingleColorStepContentProps) {
  const bodyColor = frontColors.front_body;
  const sleeveColor = frontColors.front_sleeves;
  const buttonColor = frontColors.front_buttons;
  const ribbingColor = frontColors.front_ribbing;

  const setBodyColor = useCallback(
    (hex: string | undefined) => {
      onFrontColorsChange({ ...frontColors, front_body: hex });
      onBackColorsChange({ ...backColors, back_body: hex });
    },
    [frontColors, backColors, onFrontColorsChange, onBackColorsChange]
  );
  const setSleeveColor = useCallback(
    (hex: string | undefined) => {
      onFrontColorsChange({ ...frontColors, front_sleeves: hex });
      onBackColorsChange({ ...backColors, back_sleeves: hex });
    },
    [frontColors, backColors, onFrontColorsChange, onBackColorsChange]
  );
  const setButtonColor = useCallback(
    (hex: string | undefined) => {
      onFrontColorsChange({ ...frontColors, front_buttons: hex });
    },
    [frontColors, onFrontColorsChange]
  );
  const setRibbingColor = useCallback(
    (hex: string | undefined) => {
      onFrontColorsChange({ ...frontColors, front_ribbing: hex });
    },
    [frontColors, onFrontColorsChange]
  );

  return (
    <div className="space-y-6">
      {colorKey === "body" && (
        <ExpandPanel
          openKey="body"
          presets={BODY_PRESETS}
          value={bodyColor}
          onChange={setBodyColor}
          showOther
        />
      )}
      {colorKey === "sleeve" && (
        <ExpandPanel
          openKey="sleeve"
          presets={SLEEVE_BUTTON_PRESETS}
          value={sleeveColor}
          onChange={setSleeveColor}
          extraButtons={[{ label: "몸통색과 통일", onClick: () => setSleeveColor(bodyColor) }]}
          showOther
        />
      )}
      {colorKey === "ribbing" && (
        <ExpandPanel
          openKey="ribbing"
          presets={SLEEVE_BUTTON_PRESETS}
          value={ribbingColor}
          onChange={setRibbingColor}
          extraButtons={[{ label: "몸통색과 통일", onClick: () => setRibbingColor(bodyColor) }]}
          showOther
        />
      )}
      {colorKey === "button" && (
        <ExpandPanel
          openKey="button"
          presets={SLEEVE_BUTTON_PRESETS}
          value={buttonColor}
          onChange={setButtonColor}
          showOther
        />
      )}
      {colorKey === "liningOz" && (
        <div className="space-y-3">
          <span className="text-muted-foreground text-sm font-medium">안감 두께</span>
          <div className="flex gap-2">
            {LINING_OZ_OPTIONS.map((oz) => (
              <Button
                key={oz}
                type="button"
                variant={liningOz === oz ? "default" : "outline"}
                size="sm"
                className="h-10 px-4 text-sm rounded-lg"
                onClick={() => onLiningOzChange(oz)}
              >
                {oz}oz
              </Button>
            ))}
          </div>
          <p className="text-muted-foreground text-xs">숫자가 높을수록 충전재가 많이 들어갑니다.</p>
        </div>
      )}
      {!hideNextButton && (
        <Button type="button" className="w-full" onClick={onNext}>
          다음
        </Button>
      )}
    </div>
  );
}

export function Step1Colors({
  frontColors,
  backColors,
  liningOz,
  onFrontColorsChange,
  onBackColorsChange,
  onLiningOzChange,
}: Step1ColorsProps) {
  const [openKey, setOpenKey] = useState<OpenKey>(null);
  const bodyColor = frontColors.front_body;
  const sleeveColor = frontColors.front_sleeves;
  const buttonColor = frontColors.front_buttons;
  const ribbingColor = frontColors.front_ribbing;

  const setBodyColor = useCallback(
    (hex: string | undefined) => {
      onFrontColorsChange({ ...frontColors, front_body: hex });
      onBackColorsChange({ ...backColors, back_body: hex });
    },
    [frontColors, backColors, onFrontColorsChange, onBackColorsChange]
  );

  const setSleeveColor = useCallback(
    (hex: string | undefined) => {
      onFrontColorsChange({ ...frontColors, front_sleeves: hex });
      onBackColorsChange({ ...backColors, back_sleeves: hex });
    },
    [frontColors, backColors, onFrontColorsChange, onBackColorsChange]
  );

  const setButtonColor = useCallback(
    (hex: string | undefined) => {
      onFrontColorsChange({ ...frontColors, front_buttons: hex });
    },
    [frontColors, onFrontColorsChange]
  );

  const setRibbingColor = useCallback(
    (hex: string | undefined) => {
      onFrontColorsChange({ ...frontColors, front_ribbing: hex });
    },
    [frontColors, onFrontColorsChange]
  );

  const toggleOpen = (key: OpenKey) => setOpenKey((prev) => (prev === key ? null : key));

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-3">
            <ColorChipButton
              label="몸통색"
              value={bodyColor}
              isOpen={openKey === "body"}
              onClick={() => toggleOpen("body")}
              presets={BODY_PRESETS}
            />
            <ColorChipButton
              label="팔색"
              value={sleeveColor}
              isOpen={openKey === "sleeve"}
              onClick={() => toggleOpen("sleeve")}
              presets={SLEEVE_BUTTON_PRESETS}
            />
            <ColorChipButton
              label="시보리색"
              value={ribbingColor}
              isOpen={openKey === "ribbing"}
              onClick={() => toggleOpen("ribbing")}
              presets={SLEEVE_BUTTON_PRESETS}
            />
            <ColorChipButton
              label="단추"
              value={buttonColor}
              isOpen={openKey === "button"}
              onClick={() => toggleOpen("button")}
              presets={SLEEVE_BUTTON_PRESETS}
            />
          </div>
          <div className="mt-5 pt-5 border-t border-border/60 flex flex-wrap items-center gap-3">
            <span className="text-muted-foreground text-sm font-medium">안감 두께</span>
            <div className="flex gap-2">
              {LINING_OZ_OPTIONS.map((oz) => (
                <Button
                  key={oz}
                  type="button"
                  variant={liningOz === oz ? "default" : "outline"}
                  size="sm"
                  className="h-10 px-4 text-sm rounded-lg"
                  onClick={() => onLiningOzChange(oz)}
                >
                  {oz}oz
                </Button>
              ))}
            </div>
            <p className="text-muted-foreground text-xs w-full">숫자가 높을수록 충전재가 많이 들어갑니다.</p>
          </div>
          {openKey === "body" && (
            <ExpandPanel
              openKey="body"
              onClose={() => setOpenKey(null)}
              presets={BODY_PRESETS}
              value={bodyColor}
              onChange={setBodyColor}
              showOther
            />
          )}
          {openKey === "sleeve" && (
            <ExpandPanel
              openKey="sleeve"
              onClose={() => setOpenKey(null)}
              presets={SLEEVE_BUTTON_PRESETS}
              value={sleeveColor}
              onChange={setSleeveColor}
              extraButtons={[{ label: "몸통색과 통일", onClick: () => setSleeveColor(bodyColor) }]}
              showOther
            />
          )}
          {openKey === "ribbing" && (
            <ExpandPanel
              openKey="ribbing"
              onClose={() => setOpenKey(null)}
              presets={SLEEVE_BUTTON_PRESETS}
              value={ribbingColor}
              onChange={setRibbingColor}
              extraButtons={[{ label: "몸통색과 통일", onClick: () => setRibbingColor(bodyColor) }]}
              showOther
            />
          )}
          {openKey === "button" && (
            <ExpandPanel
              openKey="button"
              onClose={() => setOpenKey(null)}
              presets={SLEEVE_BUTTON_PRESETS}
              value={buttonColor}
              onChange={setButtonColor}
              showOther
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
