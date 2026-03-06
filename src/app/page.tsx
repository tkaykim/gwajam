"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { LayerPreview, useMockupImages, PRINT_AREA_BOXES } from "@/components/mockup/LayerPreview";
import { Step1Colors, DEFAULT_COLORS, type LiningOz } from "@/components/mockup/Step1Colors";
import { getDefaultPrintAreas } from "@/components/mockup/Step2Memos";
import { Step3Contact, type PreferredContact } from "@/components/mockup/Step3Contact";
import { Step4Quantity } from "@/components/mockup/Step4Quantity";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { FrontColors, BackColors, PrintAreaKey, PrintAreaState } from "@/types/mockup";
import type { InquiryPayload, PrintAreaStatePayload } from "@/types/mockup";
import { HeaderLogoMenu } from "@/components/HeaderLogoMenu";
import { PHONE_NUMBER, KAKAO_CHAT_URL, HOMEPAGE_URL } from "@/components/QuickMenuPanel";
import { Phone, MessageCircle, Home } from "lucide-react";

const PRINT_AREA_BOX_STORAGE_KEY = "modoo-print-area-boxes";

function parsePct(s: string): number {
  return Number(String(s).replace("%", "")) || 0;
}

function getDefaultPrintAreaBoxOverrides(): Record<string, { left: number; top: number; width: number; height: number }> {
  const out: Record<string, { left: number; top: number; width: number; height: number }> = {};
  for (const [k, v] of Object.entries(PRINT_AREA_BOXES)) {
    out[k] = {
      left: parsePct(v.left),
      top: parsePct(v.top),
      width: parsePct(v.width),
      height: parsePct(v.height),
    };
  }
  return out;
}

function loadPrintAreaBoxOverrides(): Record<string, { left: number; top: number; width: number; height: number }> {
  try {
    const s = typeof window !== "undefined" ? localStorage.getItem(PRINT_AREA_BOX_STORAGE_KEY) : null;
    if (s) {
      const parsed = JSON.parse(s) as Record<string, { left: number; top: number; width: number; height: number }>;
      const defaults = getDefaultPrintAreaBoxOverrides();
      return { ...defaults, ...parsed };
    }
  } catch {
    /* ignore */
  }
  return getDefaultPrintAreaBoxOverrides();
}

function savePrintAreaBoxOverrides(data: Record<string, { left: number; top: number; width: number; height: number }>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PRINT_AREA_BOX_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}


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
  const [frontColors, setFrontColors] = useState<FrontColors>(DEFAULT_COLORS);
  const [backColors, setBackColors] = useState<BackColors>(DEFAULT_COLORS);
  const [liningOz, setLiningOz] = useState<LiningOz>(4);
  const [printAreas, setPrintAreas] = useState<Record<PrintAreaKey, PrintAreaState>>(getDefaultPrintAreas());
  const [activePrintArea, setActivePrintArea] = useState<PrintAreaKey | null>(null);
  const [printAreaBoxOverrides, setPrintAreaBoxOverrides] = useState<
    Record<string, { left: number; top: number; width: number; height: number }>
  >(() => getDefaultPrintAreaBoxOverrides());

  useEffect(() => {
    setPrintAreaBoxOverrides(loadPrintAreaBoxOverrides());
  }, []);
  const [groupName, setGroupName] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [preferredContact, setPreferredContact] = useState<PreferredContact>(null);
  const [contact, setContact] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [quantity, setQuantity] = useState("");
  const [additionalNoteText, setAdditionalNoteText] = useState("");
  const [additionalNoteImageUrl, setAdditionalNoteImageUrl] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const [privacyConsentAgreed, setPrivacyConsentAgreed] = useState(false);
  /** 색상 변경하기 패널 열림 여부 */
  const [showColorPanel, setShowColorPanel] = useState(false);
  const colorPanelRef = useRef<HTMLDivElement>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    groupName?: string;
    representativeName?: string;
    contact?: string;
    email?: string;
    quantity?: string;
    privacyConsent?: string;
  }>({});


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

  /** 인쇄 단계 스킵으로 항상 양면 표시 */
  const showOnlyFront = false;
  const showOnlyBack = false;

  /** 모바일: 색상 패널 열릴 때 화면 안으로 스크롤 */
  useEffect(() => {
    if (!showColorPanel) return;
    const t = requestAnimationFrame(() => {
      colorPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(t);
  }, [showColorPanel]);

  const handleSubmit = async () => {
    setFieldErrors({});
    const errors: typeof fieldErrors = {};
    if (!groupName.trim()) errors.groupName = "단체명을 입력해 주세요.";
    if (!representativeName.trim()) errors.representativeName = "대표자명을 입력해 주세요.";
    if (!preferredContact) {
      toast.error("연락 방법을 선택해 주세요. (전화 또는 이메일)");
      return;
    }
    if (preferredContact === "phone" && !contact.trim()) errors.contact = "연락처를 입력해 주세요.";
    if (preferredContact === "email" && !contactEmail.trim()) errors.email = "이메일을 입력해 주세요.";
    const qty = parseInt(quantity, 10);
    if (!Number.isInteger(qty) || qty < 1) {
      errors.quantity = "예상 수량을 1 이상 숫자로 입력해 주세요.";
    }
    if (!privacyConsentAgreed) {
      errors.privacyConsent = "개인정보 활용에 동의해 주세요.";
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("필수 항목을 입력해 주세요.");
      return;
    }

    const contactValue = preferredContact === "phone" ? contact.trim() : contactEmail.trim();
    setSubmitStatus("loading");
    try {
      const { print_areas, ...flat } = printAreasToPayload(printAreas);
      const payload = {
        front_colors: frontColors,
        back_colors: backColors,
        ...flat,
        print_areas: print_areas ?? null,
        group_name: groupName.trim(),
        representative_name: representativeName.trim(),
        contact: contactValue,
        email: contactEmail.trim() || null,
        quantity: qty,
        quantity_note: "최종 수량은 상담 후 결정하셔도 됩니다. 사이즈별 수량 파악은 상담 후 양식을 제공드립니다. (사이즈표 포함)",
        desired_delivery_date: null,
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
        toast.error(data.error || "제출에 실패했습니다.");
        setSubmitStatus("error");
        return;
      }
      setSubmitStatus("done");
      setShowSuccessModal(true);
    } catch {
      toast.error("네트워크 오류가 발생했습니다.");
      setSubmitStatus("error");
    }
  };

  const printAreaBoxOverridesAsStrings = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(printAreaBoxOverrides).map(([k, v]) => [
          k,
          { left: `${v.left}%`, top: `${v.top}%`, width: `${v.width}%`, height: `${v.height}%` },
        ])
      ),
    [printAreaBoxOverrides]
  );

  return (
    <main className="min-h-dvh flex flex-col pb-28 bg-background">
      {/* 웰컴 팝업 */}
      {showWelcomeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-modal-title"
        >
          <div className="bg-background rounded-2xl shadow-xl max-w-sm w-full p-7 space-y-5 text-center">
            <h2 id="welcome-modal-title" className="text-lg font-bold text-foreground leading-snug">
              색상, 디자인 위치, 수량만 알려주시면<br />빠르게 견적과 시안을 전달드리겠습니다.
            </h2>
            <Button
              type="button"
              className="w-full"
              onClick={() => setShowWelcomeModal(false)}
            >
              확인
            </Button>
          </div>
        </div>
      )}

      {/* 문의 접수 완료 팝업 */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-modal-title"
        >
          <div className="bg-background rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 id="success-modal-title" className="text-lg font-bold text-foreground">
              문의가 접수되었습니다
            </h2>
            <p className="text-muted-foreground text-sm">
              곧 담당자가 연락드리겠습니다.
            </p>
            <div className="space-y-2 pt-2">
              <a
                href={`tel:${PHONE_NUMBER.replace(/-/g, "")}`}
                className="flex items-center justify-center gap-2 w-full rounded-lg border border-border bg-background py-2.5 text-sm font-medium hover:bg-muted"
                onClick={() => setShowSuccessModal(false)}
              >
                <Phone className="w-4 h-4 shrink-0" />
                전화상담
              </a>
              <a
                href={KAKAO_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-lg border border-border bg-background py-2.5 text-sm font-medium hover:bg-muted"
                onClick={() => setShowSuccessModal(false)}
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                카톡상담
              </a>
              <a
                href={HOMEPAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-lg border border-border bg-background py-2.5 text-sm font-medium hover:bg-muted"
                onClick={() => setShowSuccessModal(false)}
              >
                <Home className="w-4 h-4 shrink-0" />
                홈페이지로 이동
              </a>
            </div>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setShowSuccessModal(false)}
            >
              확인
            </Button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-10 bg-background/98 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-1.5 md:py-3 flex items-center justify-center">
          <HeaderLogoMenu height={32} />
        </div>
      </header>

      <section className="sticky top-11 md:top-14 z-[9] flex-shrink-0 px-4 py-3 pb-4 bg-background border-b border-border/50">
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
                <div className="aspect-[3/4] max-w-[200px] mx-auto rounded-2xl bg-neutral-300 flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">로딩 중</span>
                </div>
              ) : imagesError ? (
                <div className="aspect-[3/4] max-w-[200px] mx-auto rounded-2xl bg-neutral-300 flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">이미지 없음</span>
                </div>
              ) : (
                <LayerPreview
                  side="front"
                  images={images}
                  frontColors={frontColors}
                  backColors={backColors}
                  printAreas={printAreas}
                  activePrintArea={activePrintArea}
                  printAreaBoxOverrides={printAreaBoxOverridesAsStrings}
                  enlarged={showOnlyFront}
                />
              )}
            </div>
          )}
          {!showOnlyFront && (
            <div>
              <p className="text-center text-muted-foreground text-xs mb-1">뒷면</p>
              {imagesLoading ? (
                <div className="aspect-[3/4] max-w-[200px] mx-auto rounded-2xl bg-neutral-300 flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">로딩 중</span>
                </div>
              ) : imagesError ? (
                <div className="aspect-[3/4] max-w-[200px] mx-auto rounded-2xl bg-neutral-300 flex items-center justify-center">
                  <span className="text-muted-foreground text-sm">이미지 없음</span>
                </div>
              ) : (
                <LayerPreview
                  side="back"
                  images={images}
                  frontColors={frontColors}
                  backColors={backColors}
                  printAreas={printAreas}
                  activePrintArea={activePrintArea}
                  printAreaBoxOverrides={printAreaBoxOverridesAsStrings}
                  enlarged={showOnlyBack}
                />
              )}
            </div>
          )}
            </div>
      </section>

      <section className="px-4 py-4 flex-1 max-w-xl mx-auto w-full space-y-6">
        {/* 의류 캔버스 아래: 색상 변경하기 */}
        <div className="space-y-3" ref={colorPanelRef}>
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-xl py-6 text-base font-medium"
            onClick={() => setShowColorPanel((v) => !v)}
          >
            {showColorPanel ? "색상 선택 접기" : "색상 변경하기"}
          </Button>
          {showColorPanel && (
            <div className="pt-2">
              <p className="text-muted-foreground text-sm mb-3">원하시는 제품 색상을 골라주세요.</p>
              <Step1Colors
                frontColors={frontColors}
                backColors={backColors}
                liningOz={liningOz}
                onFrontColorsChange={setFrontColors}
                onBackColorsChange={setBackColors}
                onLiningOzChange={setLiningOz}
              />
            </div>
          )}
        </div>

        {/* 단체명, 대표자명, 연락방법 → 연락처/이메일, 예상 수량, 부가설명 */}
        <Step3Contact
          groupName={groupName}
          representativeName={representativeName}
          preferredContact={preferredContact}
          contact={contact}
          email={contactEmail}
          onGroupNameChange={setGroupName}
          onRepresentativeNameChange={setRepresentativeName}
          onPreferredContactChange={setPreferredContact}
          onContactChange={setContact}
          onEmailChange={setContactEmail}
          groupNameError={fieldErrors.groupName}
          representativeNameError={fieldErrors.representativeName}
          contactError={fieldErrors.contact}
          emailError={fieldErrors.email}
        />
        <Step4Quantity
          quantity={quantity}
          onQuantityChange={setQuantity}
          quantityError={fieldErrors.quantity}
        />
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
            <div className="flex items-center gap-2 flex-wrap">
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
                <span className="flex items-center gap-2">
                  <img
                    src={additionalNoteImageUrl}
                    alt="부가설명 이미지 미리보기"
                    className="w-14 h-14 rounded-lg object-cover border border-border shrink-0"
                  />
                  <span className="text-xs text-green-600">첨부됨</span>
                </span>
              )}
            </div>
          </CardContent>
        </Card>
        <label
          className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
            fieldErrors.privacyConsent ? "border-destructive bg-destructive/5" : "border-border hover:bg-muted/30"
          }`}
        >
          <input
            type="checkbox"
            checked={privacyConsentAgreed}
            onChange={(e) => {
              setPrivacyConsentAgreed(e.target.checked);
              if (fieldErrors.privacyConsent) setFieldErrors((prev) => ({ ...prev, privacyConsent: undefined }));
            }}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary shrink-0"
            aria-describedby="privacy-consent-desc"
          />
          <span id="privacy-consent-desc" className="text-sm text-foreground leading-snug">
            <span className="font-medium">[필수] 개인정보 활용 동의</span>
            <span className="text-muted-foreground">
              {" "}문의 확인 및 응대 목적으로만 사용되며, 이용자 요청 시 파기합니다.
            </span>
          </span>
        </label>
        {fieldErrors.privacyConsent && (
          <p className="text-destructive text-xs -mt-2 flex items-center gap-1" role="alert">
            <span className="inline-block w-1 h-1 rounded-full bg-destructive" aria-hidden />
            {fieldErrors.privacyConsent}
          </p>
        )}
      </section>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-background/98 backdrop-blur-sm border-t border-border pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-xl mx-auto">
          <Button
            type="button"
            className="w-full"
            disabled={submitStatus === "loading"}
            onClick={handleSubmit}
          >
            {submitStatus === "loading" ? "제출 중…" : "견적 요청하기"}
          </Button>
        </div>
      </footer>
    </main>
  );
}
