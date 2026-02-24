"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
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
import { HeaderLogoMenu } from "@/components/HeaderLogoMenu";
import { PHONE_NUMBER, KAKAO_CHAT_URL, HOMEPAGE_URL } from "@/components/QuickMenuPanel";
import { Phone, MessageCircle, Home } from "lucide-react";

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
  const [contactEmail, setContactEmail] = useState("");
  const [quantity, setQuantity] = useState("");
  const [desiredDeliveryDate, setDesiredDeliveryDate] = useState("");
  const [additionalNoteText, setAdditionalNoteText] = useState("");
  const [additionalNoteImageUrl, setAdditionalNoteImageUrl] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  /** 문의 접수 완료 팝업 표시 */
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  /** 개인정보 활용 동의 (필수) */
  const [privacyConsentAgreed, setPrivacyConsentAgreed] = useState(false);
  /** 필수 항목 검증 시 해당 섹션에 툴팁으로 표시 */
  const [fieldErrors, setFieldErrors] = useState<{
    groupName?: string;
    representativeName?: string;
    contact?: string;
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

  /** Step2 = 앞면만, Step3 = 뒷면만, Step1·4 = 양면 */
  const showOnlyFront = step === 2;
  const showOnlyBack = step === 3;

  const handleSubmit = async () => {
    setFieldErrors({});
    const errors: typeof fieldErrors = {};

    if (!groupName.trim()) errors.groupName = "단체명을 입력해 주세요.";
    if (!representativeName.trim()) errors.representativeName = "대표자명을 입력해 주세요.";
    if (!contact.trim()) errors.contact = "연락처를 입력해 주세요.";
    const qty = parseInt(quantity, 10);
    if (!Number.isInteger(qty) || qty < 1) {
      errors.quantity = "제작 수량을 1 이상 숫자로 입력해 주세요.";
    }
    if (!privacyConsentAgreed) {
      errors.privacyConsent = "개인정보 활용에 동의해 주세요.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("필수 항목을 입력해 주세요.");
      return;
    }

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
        email: contactEmail.trim() || null,
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

  return (
    <main className="min-h-dvh flex flex-col pb-28 bg-background">
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
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <HeaderLogoMenu height={32} />
            <span className="text-muted-foreground text-sm tabular-nums">{step}/4</span>
          </div>
        </div>
      </header>

      <section className="sticky top-14 z-[9] flex-shrink-0 px-4 py-3 bg-background border-b border-border/50">
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
              email={contactEmail}
              onGroupNameChange={setGroupName}
              onRepresentativeNameChange={setRepresentativeName}
              onContactChange={setContact}
              onEmailChange={setContactEmail}
              groupNameError={fieldErrors.groupName}
              representativeNameError={fieldErrors.representativeName}
              contactError={fieldErrors.contact}
            />
            <Step4Quantity
              quantity={quantity}
              onQuantityChange={setQuantity}
              quantityError={fieldErrors.quantity}
            />
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
          </div>
        )}
      </section>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-background/98 backdrop-blur-sm border-t border-border pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-xl mx-auto flex gap-3">
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
