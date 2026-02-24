"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface Step3ContactProps {
  groupName: string;
  representativeName: string;
  contact: string;
  onGroupNameChange: (v: string) => void;
  onRepresentativeNameChange: (v: string) => void;
  onContactChange: (v: string) => void;
}

export function Step3Contact({
  groupName,
  representativeName,
  contact,
  onGroupNameChange,
  onRepresentativeNameChange,
  onContactChange,
}: Step3ContactProps) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">단체 및 대표자 정보를 입력해 주세요.</p>
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">단체명 *</Label>
            <Input
              id="groupName"
              type="text"
              required
              value={groupName}
              onChange={(e) => onGroupNameChange(e.target.value)}
              placeholder="예: OO대학교 OO학과"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="representativeName">대표자명 *</Label>
            <Input
              id="representativeName"
              type="text"
              required
              value={representativeName}
              onChange={(e) => onRepresentativeNameChange(e.target.value)}
              placeholder="예: 홍길동"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">연락처 *</Label>
            <Input
              id="contact"
              type="tel"
              required
              value={contact}
              onChange={(e) => onContactChange(e.target.value)}
              placeholder="예: 010-1234-5678"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
