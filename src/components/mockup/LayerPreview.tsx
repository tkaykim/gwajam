"use client";

import React, { useEffect, useState } from "react";
import type { MockupImageRow } from "@/types/mockup";
import type { FrontColors, BackColors, BackLayerKey, PrintAreaKey, PrintAreaState } from "@/types/mockup";
import { createClient } from "@/lib/supabase/client";

const FRONT_LAYER_ORDER: (keyof FrontColors)[] = [
  "front_body",
  "front_sleeves",
  "front_ribbing",
  "front_lining",
  "front_buttons",
];
/** 뒷면 레이어 순서: 시보리(맨 아래) → 몸통 → 팔(맨 위) */
const BACK_LAYER_ORDER: BackLayerKey[] = ["back_ribbing", "back_body", "back_sleeves"];

/** 앞면 인쇄 영역 순서 */
const FRONT_PATCH_ORDER: PrintAreaKey[] = [
  "front_left_chest",
  "front_right_chest",
  "front_left_sleeve",
  "front_right_sleeve",
];
/** 뒷면 인쇄 영역 순서 */
const BACK_PATCH_ORDER: PrintAreaKey[] = [
  "back_top",
  "back_top2",
  "back_mid",
  "back_bottom",
];
/** 인쇄 영역별 캔버스 내 상대 위치 (%, 점선 테두리용). 사용자 입장 왼/오른 = 의류 거울모드이므로 반대로 매핑 */
const PRINT_AREA_BOXES: Record<string, { left: string; top: string; width: string; height: string }> = {
  front_left_chest: { left: "52%", top: "27%", width: "24%", height: "20%" },
  front_right_chest: { left: "1%", top: "27%", width: "24%", height: "20%" },
  front_left_sleeve: { left: "72%", top: "28%", width: "26%", height: "45%" },
  front_right_sleeve: { left: "2%", top: "28%", width: "26%", height: "45%" },
  back_top: { left: "28%", top: "23%", width: "44%", height: "15%" },
  back_top2: { left: "33%", top: "32%", width: "36%", height: "10%" },
  back_mid: { left: "22%", top: "38%", width: "56%", height: "28%" },
  back_bottom: { left: "28%", top: "65%", width: "44%", height: "9%" },
};

const LAYER_LABELS: Record<string, string> = {
  front_body: "몸통",
  front_sleeves: "팔",
  front_ribbing: "목 & 몸통 시보리",
  front_lining: "안감",
  front_buttons: "단추",
  back_ribbing: "시보리",
  back_body: "몸통",
  back_sleeves: "팔",
};

export function useMockupImages() {
  const [images, setImages] = useState<MockupImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      try {
        const { data, error: e } = await supabase
          .from("mockup_images")
          .select("*")
          .order("layer_key");
        if (e) throw e;
        setImages((data as MockupImageRow[]) || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "이미지 불러오기 실패");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { images, loading, error };
}

function getImageByKey(images: MockupImageRow[], key: string): string | null {
  return images.find((i) => i.layer_key === key)?.image_url ?? null;
}

interface LayerPreviewProps {
  side: "front" | "back";
  images: MockupImageRow[];
  frontColors: FrontColors;
  backColors: BackColors;
  /** 인쇄 영역 8개 상태 (있음/없음, 면색, 테두리색). 없으면 패치 레이어 미표시 */
  printAreas?: Record<PrintAreaKey, PrintAreaState>;
  /** 선택된 인쇄 영역 키 (해당 위치에 점선 테두리 표시) */
  activePrintArea?: PrintAreaKey | null;
  /** 인쇄 영역 점선 박스 위치 오버라이드 (저장된 값, % 문자열) */
  printAreaBoxOverrides?: Record<string, { left: string; top: string; width: string; height: string }>;
  /** Step2에서 한 면만 볼 때 크게 표시 */
  enlarged?: boolean;
  /** 관리자 상세 등에서 더 크게 표시 (enlarged일 때) */
  adminSize?: boolean;
}

function PreviewBox({
  sizeClass,
  children,
}: {
  sizeClass: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={"relative w-full aspect-[3/4] mx-auto rounded-2xl overflow-hidden bg-neutral-300 " + sizeClass}
    >
      {children}
    </div>
  );
}

export function LayerPreview({
  side,
  images,
  frontColors,
  backColors,
  printAreas,
  activePrintArea,
  printAreaBoxOverrides,
  enlarged = false,
  adminSize = false,
}: LayerPreviewProps) {
  const active = activePrintArea ?? null;
  const order = side === "front" ? FRONT_LAYER_ORDER : BACK_LAYER_ORDER;
  const colors = side === "front" ? frontColors : backColors;
  /** 뒷면 시보리는 앞면 시보리 색상과 연동 */
  const getLayerColor = (key: string) => {
    if (side === "back" && key === "back_ribbing") return frontColors.front_ribbing;
    return colors[key as keyof typeof colors];
  };
  const patchOrder = side === "front" ? FRONT_PATCH_ORDER : BACK_PATCH_ORDER;
  const isActiveForThisSide =
    active &&
    (side === "front"
      ? FRONT_PATCH_ORDER.includes(active)
      : BACK_PATCH_ORDER.includes(active));
  const boxStyle =
    isActiveForThisSide && active
      ? (printAreaBoxOverrides?.[active] ?? PRINT_AREA_BOXES[active])
      : null;
  const sizeClass =
    adminSize && enlarged
      ? "max-w-[min(420px,50vw)]"
      : enlarged
        ? "max-w-[min(280px,75vw)]"
        : "max-w-[min(200px,45vw)]";

  return React.createElement(
    PreviewBox,
    { sizeClass },
    order.map((key) => {
        const url = getImageByKey(images, key);
        const color = getLayerColor(key);
        if (!url) return null;
        if (color) {
          return (
            <div
              key={key}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundColor: color,
                maskImage: `url(${url})`,
                maskSize: "cover",
                maskPosition: "center",
                maskRepeat: "no-repeat",
                WebkitMaskImage: `url(${url})`,
                WebkitMaskSize: "cover",
                WebkitMaskPosition: "center",
                WebkitMaskRepeat: "no-repeat",
              }}
              aria-hidden
            />
          );
        }
        return (
          <div
            key={key}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${url})` }}
            aria-hidden
          />
        );
      }),
    printAreas &&
        patchOrder.map((key) => {
          const url = getImageByKey(images, key);
          const borderUrl = getImageByKey(images, `${key}_border`);
          const area = printAreas[key];
          if (!url || !area?.visible) return null;
          const { faceColor, borderColor } = area;
          const hasBorderColor = borderColor != null && borderColor !== "";
          const hasFaceColor = faceColor != null && faceColor !== "";
          const patchMaskStyle = {
            maskImage: `url(${url})`,
            maskSize: "cover" as const,
            maskPosition: "center" as const,
            maskRepeat: "no-repeat" as const,
            WebkitMaskImage: `url(${url})`,
            WebkitMaskSize: "cover" as const,
            WebkitMaskPosition: "center" as const,
            WebkitMaskRepeat: "no-repeat" as const,
          };
          const borderMaskStyle = borderUrl
            ? {
                maskImage: `url(${borderUrl})`,
                maskSize: "cover" as const,
                maskPosition: "center" as const,
                maskRepeat: "no-repeat" as const,
                WebkitMaskImage: `url(${borderUrl})`,
                WebkitMaskSize: "cover" as const,
                WebkitMaskPosition: "center" as const,
                WebkitMaskRepeat: "no-repeat" as const,
              }
            : null;
          return (
            <div key={key} className="absolute inset-0 pointer-events-none" aria-hidden>
              {borderMaskStyle && hasBorderColor && (
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    ...borderMaskStyle,
                    backgroundColor: borderColor,
                  }}
                />
              )}
              {hasFaceColor && (
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    ...patchMaskStyle,
                    backgroundColor: faceColor,
                  }}
                />
              )}
            </div>
          );
        }),
    boxStyle &&
      (() => {
        const { left, top, width, height } = boxStyle;
        const l = parseFloat(left);
        const t = parseFloat(top);
        const w = parseFloat(width);
        const h = parseFloat(height);
        return React.createElement("div", {
          className: "absolute box-border pointer-events-none rounded-sm border-2 border-dashed border-primary",
          style: {
            left,
            top,
            right: `${100 - l - w}%`,
            bottom: `${100 - t - h}%`,
          },
          "aria-hidden": true,
        });
      })()
  );
}

export { FRONT_LAYER_ORDER, BACK_LAYER_ORDER, FRONT_PATCH_ORDER, BACK_PATCH_ORDER, LAYER_LABELS, PRINT_AREA_BOXES };
