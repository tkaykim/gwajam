"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { InquiryRow, MockupImageRow } from "@/types/mockup";
import { LayerPreview } from "@/components/mockup/LayerPreview";
import { inquiryRowToPrintAreas } from "@/app/admin/AdminInquiryDetail";
import { getInquiryById, getMockupImages } from "@/app/admin/actions";

type Side = "front" | "back";

export default function AdminPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const sideParam = params?.side as string | undefined;
  const [row, setRow] = useState<InquiryRow | null>(null);
  const [images, setImages] = useState<MockupImageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const side: Side | null =
    sideParam === "front" || sideParam === "back" ? sideParam : null;

  useEffect(() => {
    if (!id || !side) {
      setError("잘못된 경로입니다.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [inquiry, mockupImages] = await Promise.all([
          getInquiryById(id),
          getMockupImages(),
        ]);
        if (cancelled) return;
        if (!inquiry) {
          setError("문의를 찾을 수 없습니다.");
          return;
        }
        setRow(inquiry);
        setImages(mockupImages ?? []);
      } catch (e) {
        if (!cancelled) setError("데이터를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, side]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-800 text-white">
        로딩 중…
      </div>
    );
  }
  if (error || !row || !side) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-800 text-white">
        <p>{error ?? "잘못된 경로입니다."}</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded bg-white/20 px-4 py-2 text-sm hover:bg-white/30"
        >
          뒤로
        </button>
      </div>
    );
  }

  const printAreas = inquiryRowToPrintAreas(row);
  const frontColors = (row.front_colors ?? {}) as Record<string, string>;
  const backColors = (row.back_colors ?? {}) as Record<string, string>;

  return (
    <div className="min-h-screen bg-neutral-700 p-6 flex flex-col items-center justify-center">
      <p className="text-sm text-white/80 mb-4">
        {side === "front" ? "앞면" : "뒷면"} 미리보기
      </p>
      <div className="w-full max-w-[min(520px,90vw)]">
        <LayerPreview
          side={side}
          images={images}
          frontColors={frontColors}
          backColors={backColors}
          printAreas={printAreas}
          enlarged
          adminSize
        />
      </div>
      <button
        type="button"
        onClick={() => window.close()}
        className="mt-4 rounded bg-white/20 px-4 py-2 text-sm text-white hover:bg-white/30"
      >
        창 닫기
      </button>
    </div>
  );
}
