"use client";

import { useRef, useState } from "react";
import type { InquiryRow, MockupImageRow, PrintAreaKey, PrintAreaState } from "@/types/mockup";
import type { PrintAreaStatePayload } from "@/types/mockup";
import { LayerPreview } from "@/components/mockup/LayerPreview";
import { PRINT_AREA_LABELS, PRINT_AREA_ORDER } from "@/components/mockup/Step2Memos";

export function inquiryRowToPrintAreas(row: InquiryRow): Record<PrintAreaKey, PrintAreaState> {
  const payloadToState = (p: PrintAreaStatePayload | null): PrintAreaState => ({
    visible: p?.visible ?? true,
    faceColor: p?.face_color ?? "#ffffff",
    borderColor: p?.border_color ?? "#1a1a1a",
    text: p?.text ?? null,
    imageUrl: p?.image_url ?? null,
  });
  const areas = row.print_areas;
  const flatText: Record<string, string | null> = {
    front_left_chest_text: row.front_left_chest_text ?? null,
    front_right_chest_text: row.front_right_chest_text ?? null,
    front_left_sleeve_text: row.front_left_sleeve_text ?? null,
    front_right_sleeve_text: row.front_right_sleeve_text ?? null,
    back_top_text: row.back_top_text ?? null,
    back_mid_text: row.back_mid_text ?? null,
    back_bottom_text: row.back_bottom_text ?? null,
  };
  const flatImage: Record<string, string | null> = {
    front_left_chest_image_url: row.front_left_chest_image_url ?? null,
    front_right_chest_image_url: row.front_right_chest_image_url ?? null,
    front_left_sleeve_image_url: row.front_left_sleeve_image_url ?? null,
    front_right_sleeve_image_url: row.front_right_sleeve_image_url ?? null,
    back_top_image_url: row.back_top_image_url ?? null,
    back_mid_image_url: row.back_mid_image_url ?? null,
    back_bottom_image_url: row.back_bottom_image_url ?? null,
  };
  const result = {} as Record<PrintAreaKey, PrintAreaState>;
  for (const key of PRINT_AREA_ORDER) {
    const payload = areas?.[key] ?? null;
    result[key] = payloadToState(payload);
    const textKey = `${key}_text` as keyof typeof flatText;
    const imgKey = `${key}_image_url` as keyof typeof flatImage;
    if (flatText[textKey] != null) result[key].text = flatText[textKey];
    if (flatImage[imgKey] != null) result[key].imageUrl = flatImage[imgKey];
  }
  return result;
}

function ImageWithDownload({ url, label }: { url: string; label: string }) {
  const filename = label.replace(/\s+/g, "_") + "_" + url.split("/").pop()?.slice(0, 20) + ".png";
  return (
    <div className="flex items-start gap-2 rounded-lg bg-black/20 p-2">
      <img src={url} alt="" className="h-16 w-16 rounded object-cover border border-white/20" />
      <a
        href={url}
        download={filename}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-sky-300 hover:text-sky-200 underline"
      >
        원본 다운로드
      </a>
    </div>
  );
}

interface AdminInquiryDetailProps {
  row: InquiryRow;
  images: MockupImageRow[];
  onStatusChange: (id: string, status: "pending" | "contacted" | "done") => void;
  onAdminMemoChange?: (id: string, memo: string) => void;
}

export function AdminInquiryDetail({
  row,
  images,
  onStatusChange,
  onAdminMemoChange,
}: AdminInquiryDetailProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);
  const [adminMemo, setAdminMemo] = useState(row.admin_memo ?? "");
  const printAreas = inquiryRowToPrintAreas(row);
  const frontColors = (row.front_colors ?? {}) as Record<string, string>;
  const backColors = (row.back_colors ?? {}) as Record<string, string>;

  async function handleCapture() {
    if (!previewRef.current) return;
    setCapturing(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(previewRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#d4d4d4",
        scale: 2,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `문의_${row.group_name}_${row.id.slice(0, 8)}.png`;
      a.click();
    } finally {
      setCapturing(false);
    }
  }

  const imageKeys: PrintAreaKey[] = [
    "front_left_chest",
    "front_right_chest",
    "front_left_sleeve",
    "front_right_sleeve",
    "back_top",
    "back_top2",
    "back_mid",
    "back_bottom",
  ];

  return (
    <div className="mt-4 space-y-5 rounded-lg border border-white/10 bg-black/20 p-4">
      {/* 연락처·기본 정보 */}
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">연락처 정보</h4>
        <ul className="text-sm text-white/90 space-y-1">
          <li>단체명: <strong>{row.group_name}</strong></li>
          <li>대표자: {row.representative_name}</li>
          <li>연락처: {row.contact}</li>
          <li>이메일: {row.email?.trim() ? row.email : "없음"}</li>
          <li>제작 수량: <strong>{row.quantity}</strong>벌</li>
          {row.desired_delivery_date && <li>수령 희망일: {row.desired_delivery_date}</li>}
          <li className="text-white/50 pt-1">접수: {new Date(row.created_at).toLocaleString("ko-KR")}</li>
        </ul>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-white/50 text-sm">상태</span>
          <select
            value={row.status}
            onChange={(e) => onStatusChange(row.id, e.target.value as "pending" | "contacted" | "done")}
            className="rounded bg-white/10 border border-white/20 px-2 py-1 text-sm text-white"
          >
            <option value="pending">대기</option>
            <option value="contacted">연락함</option>
            <option value="done">완료</option>
          </select>
        </div>
        {onAdminMemoChange && (
          <div className="mt-3">
            <label className="text-xs text-white/50 block mb-1">관리자 메모</label>
            <textarea
              value={adminMemo}
              onChange={(e) => setAdminMemo(e.target.value)}
              onBlur={() => adminMemo !== (row.admin_memo ?? "") && onAdminMemoChange(row.id, adminMemo)}
              placeholder="내부 메모"
              rows={2}
              className="w-full rounded bg-white/10 border border-white/20 px-2 py-1.5 text-sm text-white placeholder:text-white/40"
            />
          </div>
        )}
      </section>

      {/* 인쇄 영역별 텍스트·이미지 */}
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">인쇄 영역별 요청</h4>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {imageKeys.map((key) => {
            const area = printAreas[key];
            const text = area?.text?.trim();
            const imageUrl = area?.imageUrl;
            const label = PRINT_AREA_LABELS[key];
            if (!text && !imageUrl) return null;
            return (
              <div key={key} className="rounded-lg border border-white/10 bg-white/5 p-2">
                <p className="text-xs font-medium text-white/80 mb-1">{label}</p>
                {text && <p className="text-xs text-white/90 whitespace-pre-wrap break-words">{text}</p>}
                {imageUrl && <ImageWithDownload url={imageUrl} label={label} />}
              </div>
            );
          })}
        </div>
      </section>

      {/* 부가설명 */}
      {(row.additional_note_text || row.additional_note_image_url) && (
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">부가설명</h4>
          {row.additional_note_text && (
            <p className="text-sm text-white/90 whitespace-pre-wrap rounded bg-white/5 p-2">{row.additional_note_text}</p>
          )}
          {row.additional_note_image_url && (
            <div className="mt-2">
              <ImageWithDownload url={row.additional_note_image_url} label="부가설명" />
            </div>
          )}
        </section>
      )}

      {/* 디자인 미리보기 + 캡처 */}
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">디자인 미리보기</h4>
        <div ref={previewRef} className="flex flex-wrap justify-center gap-4 rounded-lg bg-neutral-300/90 p-4">
          <div>
            <p className="text-center text-xs text-white/70 mb-1">앞면</p>
            <LayerPreview
              side="front"
              images={images}
              frontColors={frontColors}
              backColors={backColors}
              printAreas={printAreas}
              enlarged
              adminSize
            />
            <a
              href={`/admin/preview/${row.id}/front`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-center text-xs text-sky-300 hover:text-sky-200 underline"
            >
              앞면 새창으로 보기
            </a>
          </div>
          <div>
            <p className="text-center text-xs text-white/70 mb-1">뒷면</p>
            <LayerPreview
              side="back"
              images={images}
              frontColors={frontColors}
              backColors={backColors}
              printAreas={printAreas}
              enlarged
              adminSize
            />
            <a
              href={`/admin/preview/${row.id}/back`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-center text-xs text-sky-300 hover:text-sky-200 underline"
            >
              뒷면 새창으로 보기
            </a>
          </div>
        </div>
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={handleCapture}
            disabled={capturing}
            className="rounded-lg bg-white/20 px-4 py-2 text-sm text-white hover:bg-white/30 disabled:opacity-50"
          >
            {capturing ? "캡처 중…" : "디자인 이미지로 저장"}
          </button>
        </div>
      </section>
    </div>
  );
}
