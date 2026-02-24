"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface Step4QuantityProps {
  quantity: string;
  onQuantityChange: (v: string) => void;
  /** 필수 항목 검증 시 해당 필드 아래 툴팁으로 표시 */
  quantityError?: string;
}

export function Step4Quantity({ quantity, onQuantityChange, quantityError }: Step4QuantityProps) {
  const numOnly = (v: string) => v.replace(/\D/g, "");

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">총 제작 수량을 입력해 주세요.</p>
      <Card>
        <CardContent className="pt-4 space-y-2">
          <div className="space-y-2">
            <Label htmlFor="quantity">제작 수량 *</Label>
            <Input
              id="quantity"
              type="text"
              inputMode="numeric"
              required
              value={quantity}
              onChange={(e) => onQuantityChange(numOnly(e.target.value))}
              placeholder="예: 50"
              className={quantityError ? "border-destructive" : ""}
            />
            {quantityError && (
              <p className="text-destructive text-xs flex items-center gap-1" role="alert">
                <span className="inline-block w-1 h-1 rounded-full bg-destructive" aria-hidden />
                {quantityError}
              </p>
            )}
          </div>
          <p className="text-muted-foreground text-xs whitespace-pre-line">
            최종 수량은 상담 후 결정하셔도 됩니다.
            사이즈별 수량 파악은 상담 후 양식을 제공드립니다.
            (사이즈표 포함)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
