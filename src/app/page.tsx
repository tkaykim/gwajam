"use client";

import { useState, useCallback } from "react";
import { LayerPreview, useMockupImages } from "@/components/mockup/LayerPreview";
import { Step1Colors, DEFAULT_COLORS, type LiningOz } from "@/components/mockup/Step1Colors";
import { Step2Memos, getDefaultPrintAreas } from "@/components/mockup/Step2Memos";
import { Step3Contact } from "@/components/mockup/Step3Contact";
import { Step4Quantity } from "@/components/mockup/Step4Quantity";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { FrontColors, BackColors, PrintAreaKey, PrintAreaState } from "@/types/mockup";
import type { InquiryPayload, PrintAreaStatePayload } from "@/types/mockup";
import { SiteLogo } from "@/components/SiteLogo";

const STEPS = [
  { id: 1, title: "색상 설정" },
  { id: 2, title: "앞면 인쇄" },
  { id: 3, title: "뒷면 인쇄" },
  { id: 4, title: "확인 및 문의" },
];

function printAreaToPayload(a: PrintAreaState): PrintAreaStatePayload {
  return {
    visible: a.visible,
    face_color: a.faceColor,
    border_color: a.borderColor,
    text: a.text,
    image_url: a.imageUrl,
  };
}

function printAreasToPayload(printAreas: Record<PrintAreaKey, PrintAreaState>) {
  const keysForFlat: PrintAreaKey[] = [
    "front_left_chest",
    "front_right_chest",
    "front_left_sleeve",
    "front_right_sleeve",
    "back_top",
    "back_mid",
    "back_bottom",
  ];
  const flat: Record<string, string | null> = {};
  keysForFlat.forEach((key) => {
    const a = printAreas[key];
    flat[`${key}_text`] = a?.text ?? null;
    flat[`${key}_image_url`] = a?.imageUrl ?? null;
  });
  const allKeys: PrintAreaKey[] = [
    "front_left_chest",
    "front_right_chest",
    "front_left_sleeve",
    "front_right_sleeve",
    "back_top",
    "back_top2",
    "back_mid",
    "back_bottom",
  ];
  const print_areas = Object.fromEntries(
    allKeys.map((key) => [
      key,
      printAreaToPayload(
        printAreas[key] ?? {
          visible: true,
          faceColor: "#ffffff",
          borderColor: "#1a1a1a",
          text: null,
          imageUrl: null,
        }
      ),
    ])
  ) as Record<PrintAreaKey, PrintAreaStatePayload>;
  return { ...flat, print_areas } as {
    front_left_chest_text: string | null;
    front_left_chest_image_url: string | null;
    front_right_chest_text: string | null;
    front_right_chest_image_url: string | null;
    front_left_sleeve_text: string | null;
    front_left_sleeve_image_url: string | null;
    front_right_sleeve_text: string | null;
    front_right_sleeve_image_url: string | null;
    back_top_text: string | null;
    back_top_image_url: string | null;
    back_mid_text: string | null;
    back_mid_image_url: string | null;
    back_bottom_text: string | null;
    back_bottom_image_url: string | null;
    print_areas: Record<PrintAreaKey, PrintAreaStatePayload>;
  };
}

export default function HomePage() {
  const { images, loading: imagesLoading, error: imagesError } = useMockupImages();
  const [step, setStep] = useState(1);
  const [frontColors, setFrontColors] = useState<FrontColors>(DEFAULT_COLORS);
  const [backColors, setBackColors] = useState<BackColors>(DEFAULT_COLORS);
  const [liningOz, setLiningOz] = useState<LiningOz>(4);
  const [printAreas, setPrintAreas] = useState<Record<PrintAreaKey, PrintAreaState>>(getDefaultPrintAreas());
  const [groupName, setGroupName] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [contact, setContact] = useState("");
  const [quantity, setQuantity] = useState("");
  const [desiredDeliveryDate, setDesiredDeliveryDate] = useState("");
  const [additionalNoteText, setAdditionalNoteText] = useState("");
  const [additionalNoteImageUrl, setAdditionalNoteImageUrl] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [submitError, setSubmitError] = useState("");

  const handleImageUpload = useCallback(
    async (section: PrintAreaKey, file: File): Promise<string | null> => {
      const form = new FormData();
      form.set("file", file);
      form.set("section", section);
      const res = await fetch("/api/upload-memo", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) return null;
      return data.url ?? null;
    },
    []
  );

  const handleAdditionalNoteImageUpload = useCallback(async (file: File): Promise<string | null> => {
    const form = new FormData();
    form.set("file", file);
    form.set("section", "additional_note");
    const res = await fetch("/api/upload-memo", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) return null;
    return data.url ?? null;
  }, []);

  /** Step2 = 앞면만, Step3 = 뒷면만, Step1·4 = 양면 */
  const showOnlyFront = step === 2;
  const showOnlyBack = step === 3;

  const handleSubmit = async () => {
    if (!groupName.trim() || !representativeName.trim() || !contact.trim()) {
      setSubmitError("단체명, 대표자명, 연락처를 입력해 주세요.");
      return;
    }
    const qty = parseInt(quantity, 10);
    if (!Number.isInteger(qty) || qty < 1) {
      setSubmitError("제작 수량을 1 이상 숫자로 입력해 주세요.");
      return;
    }
    setSubmitError("");
    setSubmitStatus("loading");
    try {
      const { print_areas, ...flat } = printAreasToPayload(printAreas);
      const payload: InquiryPayload = {
        front_colors: frontColors,
        back_colors: backColors,
        ...flat,
        print_areas,
        group_name: groupName.trim(),
        representative_name: representativeName.trim(),
        contact: contact.trim(),
        quantity: qty,
        quantity_note: "제출 후 약간의 변동은 있어도 괜찮습니다.",
        desired_delivery_date: desiredDeliveryDate.trim() || null,
        additional_note_text: additionalNoteText.trim() || null,
        additional_note_image_url: additionalNoteImageUrl || null,
        lining_oz: liningOz,
      };
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "제출에 실패했습니다.");
        setSubmitStatus("error");
        return;
      }
      setSubmitStatus("done");
    } catch {
      setSubmitError("네트워크 오류가 발생했습니다.");
      setSubmitStatus("error");
    }
  };

  if (submitStatus === "done") {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center p-6 bg-background">
        <div className="text-center space-y-4 max-w-sm">
          <h1 className="text-xl font-bold text-foreground">문의가 접수되었습니다</h1>
          <p className="text-muted-foreground text-sm">
            확인 후 입력하신 연락처로 연락드리겠습니다.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col pb-28 bg-background">
      <header className="sticky top-0 z-10 bg-background/98 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <SiteLogo height={32} />
            <span className="text-muted-foreground text-sm tabular-nums">{step}/4</span>
          </div>
        </div>
      </header>

      <section className="px-4 py-3 flex-shrink-0">
        <div
          className={
            showOnlyFront || showOnlyBack
              ? "max-w-[min(280px,75vw)] mx-auto"
              : "grid grid-cols-2 gap-3 max-w-xl mx-auto"
          }
        >
          {!showOnlyBack && (
            <div>
              <p className="text-center text-muted-foreground text-xs mb-1">앞면</p>
              {imagesLoading ? (
                <div className="aspect-[3/4] max-w-[200px] mx-auto rounded-2xl bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">로딩 중</span>
                </div>
              ) : imagesError ? (
                <div className="aspect-[3/4] max-w-[200px] mx-auto rounded-2xl bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">이미지 없음</span>
                </div>
              ) : (
                <LayerPreview
                  side="front"
                  images={images}
                  frontColors={frontColors}
                  backColors={backColors}
                  printAreas={printAreas}
                  enlarged={showOnlyFront}
                />
              )}
            </div>
          )}
          {!showOnlyFront && (
            <div>
              <p className="text-center text-muted-foreground text-xs mb-1">뒷면</p>
              {imagesLoading ? (
                <div className="aspect-[3/4] max-w-[200px] mx-auto rounded-2xl bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">로딩 중</span>
                </div>
              ) : imagesError ? (
                <div className="aspect-[3/4] max-w-[200px] mx-auto rounded-2xl bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">이미지 없음</span>
                </div>
              ) : (
                <LayerPreview
                  side="back"
                  images={images}
                  frontColors={frontColors}
                  backColors={backColors}
                  printAreas={printAreas}
                  enlarged={showOnlyBack}
                />
              )}
            </div>
          )}
        </div>
      </section>

      <section className="px-4 py-4 flex-1 max-w-xl mx-auto w-full">
        {step === 1 && (
          <Step1Colors
            frontColors={frontColors}
            backColors={backColors}
            liningOz={liningOz}
            onFrontColorsChange={setFrontColors}
            onBackColorsChange={setBackColors}
            onLiningOzChange={setLiningOz}
          />
        )}
        {step === 2 && (
          <Step2Memos
            printAreas={printAreas}
            onPrintAreasChange={setPrintAreas}
            onImageUpload={handleImageUpload}
            side="front"
          />
        )}
        {step === 3 && (
          <Step2Memos
            printAreas={printAreas}
            onPrintAreasChange={setPrintAreas}
            onImageUpload={handleImageUpload}
            side="back"
          />
        )}
        {step === 4 && (
          <div className="space-y-6">
            <p className="text-muted-foreground text-sm">
              설정을 확인한 뒤 아래 정보를 입력하고 문의를 제출해 주세요.
            </p>
            <Step3Contact
              groupName={groupName}
              representativeName={representativeName}
              contact={contact}
              onGroupNameChange={setGroupName}
              onRepresentativeNameChange={setRepresentativeName}
              onContactChange={setContact}
            />
            <Step4Quantity quantity={quantity} onQuantityChange={setQuantity} />
            <Card>
              <CardContent className="pt-4 space-y-2">
                <Label htmlFor="desiredDeliveryDate">수령 희망일</Label>
                <Input
                  id="desiredDeliveryDate"
                  type="date"
                  value={desiredDeliveryDate}
                  onChange={(e) => setDesiredDeliveryDate(e.target.value)}
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 space-y-3">
                <Label htmlFor="additionalNote">부가설명</Label>
                <textarea
                  id="additionalNote"
                  value={additionalNoteText}
                  onChange={(e) => setAdditionalNoteText(e.target.value)}
                  placeholder="제작에 참고할만한 내용이 있다면 남겨주세요 (ex. 이전 제작사례 이미지, 재질에 대한 궁금증, 기타 참고사항 등)"
                  rows={4}
                  className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 resize-none"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="additional-note-image"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = await handleAdditionalNoteImageUpload(file);
                      if (url) setAdditionalNoteImageUrl(url);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("additional-note-image")?.click()}
                  >
                    이미지 첨부
                  </Button>
                  {additionalNoteImageUrl && (
                    <span className="text-xs text-green-600 truncate max-w-[140px]">첨부됨</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-background/98 backdrop-blur-sm border-t border-border pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-xl mx-auto flex gap-3">
          {submitError && (
            <p className="absolute bottom-full left-4 right-4 mb-1 text-destructive text-sm">
              {submitError}
            </p>
          )}
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setStep((s) => s - 1)}
            >
              이전
            </Button>
          )}
          {step < 4 ? (
            <Button
              type="button"
              className="flex-1"
              onClick={() => setStep((s) => s + 1)}
            >
              다음
            </Button>
          ) : (
            <Button
              type="button"
              className="flex-1"
              disabled={submitStatus === "loading"}
              onClick={handleSubmit}
            >
              {submitStatus === "loading" ? "제출 중…" : "문의 제출하기"}
            </Button>
          )}
        </div>
      </footer>
    </main>
  );
}
