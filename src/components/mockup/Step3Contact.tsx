"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface Step3ContactProps {
  groupName: string;
  representativeName: string;
  contact: string;
  email: string;
  onGroupNameChange: (v: string) => void;
  onRepresentativeNameChange: (v: string) => void;
  onContactChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  /** 필수 항목 검증 시 해당 필드 아래 툴팁으로 표시 */
  groupNameError?: string;
  representativeNameError?: string;
  contactError?: string;
}

export function Step3Contact({
  groupName,
  representativeName,
  contact,
  email,
  onGroupNameChange,
  onRepresentativeNameChange,
  onContactChange,
  onEmailChange,
  groupNameError,
  representativeNameError,
  contactError,
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
              className={groupNameError ? "border-destructive" : ""}
            />
            {groupNameError && (
              <p className="text-destructive text-xs flex items-center gap-1" role="alert">
                <span className="inline-block w-1 h-1 rounded-full bg-destructive" aria-hidden />
                {groupNameError}
              </p>
            )}
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
              className={representativeNameError ? "border-destructive" : ""}
            />
            {representativeNameError && (
              <p className="text-destructive text-xs flex items-center gap-1" role="alert">
                <span className="inline-block w-1 h-1 rounded-full bg-destructive" aria-hidden />
                {representativeNameError}
              </p>
            )}
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
              className={contactError ? "border-destructive" : ""}
            />
            {contactError && (
              <p className="text-destructive text-xs flex items-center gap-1" role="alert">
                <span className="inline-block w-1 h-1 rounded-full bg-destructive" aria-hidden />
                {contactError}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">이메일 (선택)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="예: contact@example.com"
            />
            <p className="text-muted-foreground text-xs">
              이메일 기입 시, 디자인 시안 및 견적을 이메일로도 함께 보내드립니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
