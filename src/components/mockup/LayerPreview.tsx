"use client";

import { useEffect, useState } from "react";
import type { MockupImageRow } from "@/types/mockup";
import type { FrontColors, BackColors, PrintAreaKey, PrintAreaState } from "@/types/mockup";
import { createClient } from "@/lib/supabase/client";

const FRONT_LAYER_ORDER: (keyof FrontColors)[] = [
  "front_body",
  "front_sleeves",
  "front_ribbing",
  "front_lining",
  "front_buttons",
];
const BACK_LAYER_ORDER: (keyof BackColors)[] = ["back_sleeves", "back_body"];

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

const LAYER_LABELS: Record<string, string> = {
  front_body: "몸통",
  front_sleeves: "팔",
  front_ribbing: "목 & 몸통 시보리",
  front_lining: "안감",
  front_buttons: "단추",
  back_body: "몸통",
  back_sleeves: "팔",
};

/** drop-shadow로 테두리 비슷하게: 8방향 2px 오프셋 */
function outlineDropShadow(color: string, px: number = 2) {
  const c = `drop-shadow(-${px}px -${px}px 0 ${color}) drop-shadow(${px}px -${px}px 0 ${color}) drop-shadow(-${px}px ${px}px 0 ${color}) drop-shadow(${px}px ${px}px 0 ${color}) drop-shadow(-${px}px 0 0 ${color}) drop-shadow(${px}px 0 0 ${color}) drop-shadow(0 -${px}px 0 ${color}) drop-shadow(0 ${px}px 0 ${color})`;
  return c;
}

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
  /** Step2에서 한 면만 볼 때 크게 표시 */
  enlarged?: boolean;
}

export function LayerPreview({
  side,
  images,
  frontColors,
  backColors,
  printAreas,
  enlarged = false,
}: LayerPreviewProps) {
  const order = side === "front" ? FRONT_LAYER_ORDER : BACK_LAYER_ORDER;
  const colors = side === "front" ? frontColors : backColors;
  const patchOrder = side === "front" ? FRONT_PATCH_ORDER : BACK_PATCH_ORDER;

  return (
    <div
      className={`relative w-full aspect-[3/4] mx-auto bg-muted rounded-2xl overflow-hidden ${
        enlarged ? "max-w-[min(280px,75vw)]" : "max-w-[min(200px,45vw)]"
      }`}
    >
      {/* 1) 재킷 베이스 레이어 */}
      {order.map((key) => {
        const url = getImageByKey(images, key);
        const color = colors[key as keyof typeof colors];
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
      })}

      {/* 2) 인쇄 영역 패치 레이어 (있음일 때만, 테두리 → 면 순) */}
      {printAreas &&
        patchOrder.map((key) => {
          const url = getImageByKey(images, key);
          const area = printAreas[key];
          if (!url || !area?.visible) return null;
          const { faceColor, borderColor } = area;
          const maskStyle = {
            maskImage: `url(${url})`,
            maskSize: "cover" as const,
            maskPosition: "center" as const,
            maskRepeat: "no-repeat" as const,
            WebkitMaskImage: `url(${url})`,
            WebkitMaskSize: "cover" as const,
            WebkitMaskPosition: "center" as const,
            WebkitMaskRepeat: "no-repeat" as const,
          };
          return (
            <div key={key} className="absolute inset-0 pointer-events-none" aria-hidden>
              {/* 테두리: drop-shadow로 아웃라인 */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  ...maskStyle,
                  backgroundColor: borderColor,
                  filter: outlineDropShadow(borderColor, 2),
                }}
              />
              {/* 면 채우기 */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  ...maskStyle,
                  backgroundColor: faceColor,
                }}
              />
            </div>
          );
        })}
    </div>
  );
}

export { FRONT_LAYER_ORDER, BACK_LAYER_ORDER, FRONT_PATCH_ORDER, BACK_PATCH_ORDER, LAYER_LABELS };
