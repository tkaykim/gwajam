"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface Step4QuantityProps {
  quantity: string;
  onQuantityChange: (v: string) => void;
}

export function Step4Quantity({ quantity, onQuantityChange }: Step4QuantityProps) {
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
            />
          </div>
          <p className="text-muted-foreground text-xs">
            제출 후 약간의 변동은 있어도 괜찮습니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
