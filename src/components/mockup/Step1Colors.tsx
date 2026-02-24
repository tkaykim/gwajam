"use client";

import { useState, useCallback } from "react";
import { HexColorPicker } from "react-colorful";
import type { FrontColors, BackColors } from "@/types/mockup";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const SLEEVE_BUTTON_PRESETS = [
  { name: "흰색", hex: "#ffffff" },
  { name: "검정", hex: "#1a1a1a" },
] as const;

const LINING_OZ_OPTIONS = [0, 2, 4] as const;
export type LiningOz = (typeof LINING_OZ_OPTIONS)[number];

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

function PresetOrCustom({
  label,
  presets,
  value,
  onChange,
  showOther = true,
}: {
  label: string;
  presets: readonly { name: string; hex: string }[];
  value: string;
  onChange: (hex: string) => void;
  showOther?: boolean;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const isPreset = presets.some((p) => p.hex.toLowerCase() === value?.toLowerCase());

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.hex}
              type="button"
              onClick={() => onChange(p.hex)}
              className={`w-9 h-9 rounded-lg border-2 shrink-0 transition ${
                value?.toLowerCase() === p.hex.toLowerCase()
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-border hover:border-primary/50"
              }`}
              style={{ backgroundColor: p.hex }}
              title={p.name}
            />
          ))}
          {showOther && (
            <Button
              type="button"
              variant={showPicker || (value && !isPreset) ? "default" : "outline"}
              size="sm"
              className="h-9"
              onClick={() => setShowPicker((o) => !o)}
            >
              기타
            </Button>
          )}
        </div>
        {showOther && showPicker && (
          <div className="pt-2 border-t border-border space-y-2">
            <HexColorPicker
              color={value || "#333333"}
              onChange={onChange}
              style={{ width: "100%" }}
            />
            <Input
              type="text"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              className="font-mono text-sm h-10"
            />
          </div>
        )}
      </CardContent>
    </Card>
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
  const bodyColor = frontColors.front_body ?? DEFAULT_BODY;
  const sleeveColor = frontColors.front_sleeves ?? DEFAULT_SLEEVE;
  const buttonColor = frontColors.front_buttons ?? DEFAULT_BUTTON;
  const ribbingColor = frontColors.front_ribbing ?? "#ffffff";

  const setBodyColor = useCallback(
    (hex: string) => {
      onFrontColorsChange({ ...frontColors, front_body: hex });
      onBackColorsChange({ ...backColors, back_body: hex });
    },
    [frontColors, backColors, onFrontColorsChange, onBackColorsChange]
  );

  const setSleeveColor = useCallback(
    (hex: string) => {
      onFrontColorsChange({ ...frontColors, front_sleeves: hex });
      onBackColorsChange({ ...backColors, back_sleeves: hex });
    },
    [frontColors, backColors, onFrontColorsChange, onBackColorsChange]
  );

  const setButtonColor = useCallback(
    (hex: string) => {
      onFrontColorsChange({ ...frontColors, front_buttons: hex });
    },
    [frontColors, onFrontColorsChange]
  );

  const setRibbingColor = useCallback(
    (hex: string) => {
      onFrontColorsChange({ ...frontColors, front_ribbing: hex });
    },
    [frontColors, onFrontColorsChange]
  );

  return (
    <div className="space-y-5">
      <PresetOrCustom
        label="몸통색"
        presets={BODY_PRESETS}
        value={bodyColor}
        onChange={setBodyColor}
      />
      <PresetOrCustom
        label="팔색"
        presets={SLEEVE_BUTTON_PRESETS}
        value={sleeveColor}
        onChange={setSleeveColor}
      />
      <PresetOrCustom
        label="시보리색"
        presets={[{ name: "흰색", hex: "#ffffff" }, ...SLEEVE_BUTTON_PRESETS]}
        value={ribbingColor}
        onChange={setRibbingColor}
      />
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">안감 두께</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-xs mb-3">
            숫자가 높을수록 충전재가 많이 들어갑니다.
          </p>
          <div className="flex gap-2">
            {LINING_OZ_OPTIONS.map((oz) => (
              <Button
                key={oz}
                type="button"
                variant={liningOz === oz ? "default" : "outline"}
                className="flex-1"
                onClick={() => onLiningOzChange(oz)}
              >
                {oz}온스
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
      <PresetOrCustom
        label="단추"
        presets={SLEEVE_BUTTON_PRESETS}
        value={buttonColor}
        onChange={setButtonColor}
      />
    </div>
  );
}
