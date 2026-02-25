"use client";

import { useEffect, useState, useRef } from "react";
import { uploadMockupImage, getMockupImages } from "./actions";
import type { MockupImageRow } from "@/types/mockup";

const LAYER_KEYS = [
  { key: "front_body", label: "앞면 몸통" },
  { key: "front_sleeves", label: "앞면 팔" },
  { key: "front_ribbing", label: "앞면 목·몸통 시보리" },
  { key: "front_lining", label: "앞면 안감" },
  { key: "front_buttons", label: "앞면 단추" },
  { key: "back_body", label: "뒷면 몸통" },
  { key: "back_ribbing", label: "뒷면 시보리" },
  { key: "back_sleeves", label: "뒷면 팔" },
  { key: "front_left_chest", label: "왼쪽 가슴 (인쇄)" },
  { key: "front_right_chest", label: "오른쪽 가슴 (인쇄)" },
  { key: "front_left_sleeve", label: "왼팔 (인쇄)" },
  { key: "front_right_sleeve", label: "오른팔 (인쇄)" },
  { key: "back_top", label: "뒷면 상단 (인쇄)" },
  { key: "back_top2", label: "뒷면 상단2 (인쇄)" },
  { key: "back_mid", label: "뒷면 중단 (인쇄)" },
  { key: "back_bottom", label: "뒷면 하단 (인쇄)" },
  { key: "front_left_chest_border", label: "왼쪽 가슴 테두리" },
  { key: "front_right_chest_border", label: "오른쪽 가슴 테두리" },
  { key: "front_left_sleeve_border", label: "왼팔 테두리" },
  { key: "front_right_sleeve_border", label: "오른팔 테두리" },
  { key: "back_top_border", label: "뒷면 상단 테두리" },
  { key: "back_top2_border", label: "뒷면 상단2 테두리" },
  { key: "back_mid_border", label: "뒷면 중단 테두리" },
  { key: "back_bottom_border", label: "뒷면 하단 테두리" },
] as const;

export function UploadMockupForm() {
  const [layers, setLayers] = useState<Record<string, MockupImageRow>>({});
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function load() {
    setLoading(true);
    const list = await getMockupImages();
    const map: Record<string, MockupImageRow> = {};
    list.forEach((row) => {
      map[row.layer_key] = row;
    });
    setLayers(map);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleFileChange(key: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file?.size) return;
    setMessage(null);
    setUploadingKey(key);
    const formData = new FormData();
    formData.set("file", file);
    const result = await uploadMockupImage(key, null, formData);
    setUploadingKey(null);
    e.target.value = "";
    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "ok", text: "저장되었습니다." });
      setLayers((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          id: prev[key]?.id ?? "",
          created_at: prev[key]?.created_at ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
          layer_key: key,
          image_url: result.url!,
          label: null,
        } as MockupImageRow,
      }));
    }
  }

  if (loading) {
    return (
      <div className="p-4 text-white/60">목업 이미지 목록 로딩 중…</div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-white/70 text-sm">
        각 레이어를 클릭하면 연결된 이미지를 바로 변경할 수 있습니다. PNG(알파 채널) 권장.
      </p>
      {message && (
        <p
          className={
            message.type === "error"
              ? "text-red-400 text-sm"
              : "text-green-400 text-sm"
          }
        >
          {message.text}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {LAYER_KEYS.map(({ key, label }) => {
          const row = layers[key];
          const imageUrl = row?.image_url ?? null;
          const isUploading = uploadingKey === key;

          return (
            <div
              key={key}
              className="rounded-xl border border-white/20 bg-white/5 overflow-hidden"
            >
              <div className="px-3 py-2 border-b border-white/10 text-sm font-medium text-white/90">
                {label}
              </div>
              <label className="block cursor-pointer">
                <input
                  ref={(el) => {
                    fileInputRefs.current[key] = el;
                  }}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileChange(key, e)}
                  disabled={isUploading}
                />
                <div className="aspect-[3/4] relative bg-neutral-800/80 flex items-center justify-center min-h-[100px]">
                  {isUploading ? (
                    <span className="text-white/50 text-sm">업로드 중…</span>
                  ) : imageUrl ? (
                    <>
                      <img
                        src={imageUrl}
                        alt={label}
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          클릭하여 이미지 변경
                        </span>
                      </div>
                    </>
                  ) : (
                    <span className="text-white/40 text-sm text-center px-2">
                      이미지 없음
                      <br />
                      <span className="text-xs">클릭하여 업로드</span>
                    </span>
                  )}
                </div>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
