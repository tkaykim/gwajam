"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail } from "lucide-react";

export type PreferredContact = "phone" | "email" | null;

interface Step3ContactProps {
  groupName: string;
  representativeName: string;
  preferredContact: PreferredContact;
  contact: string;
  email: string;
  onGroupNameChange: (v: string) => void;
  onRepresentativeNameChange: (v: string) => void;
  onPreferredContactChange: (v: PreferredContact) => void;
  onContactChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  groupNameError?: string;
  representativeNameError?: string;
  contactError?: string;
  emailError?: string;
}

export function Step3Contact({
  groupName,
  representativeName,
  preferredContact,
  contact,
  email,
  onGroupNameChange,
  onRepresentativeNameChange,
  onPreferredContactChange,
  onContactChange,
  onEmailChange,
  groupNameError,
  representativeNameError,
  contactError,
  emailError,
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
            <Label className="block">연락 방법</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onPreferredContactChange("phone")}
                className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition shrink-0 flex-1 ${
                  preferredContact === "phone"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <Phone className="w-4 h-4 shrink-0" />
                전화가 편해요
              </button>
              <button
                type="button"
                onClick={() => onPreferredContactChange("email")}
                className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-medium transition shrink-0 flex-1 ${
                  preferredContact === "email"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <Mail className="w-4 h-4 shrink-0" />
                이메일이 편해요
              </button>
            </div>
          </div>
          {preferredContact === "phone" && (
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
          )}
          {preferredContact === "email" && (
            <div className="space-y-2">
              <Label htmlFor="email">이메일 *</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="예: contact@example.com"
                className={emailError ? "border-destructive" : ""}
              />
              <p className="text-muted-foreground text-xs">
                디자인 시안 및 견적을 이메일로 보내드립니다.
              </p>
              {emailError && (
                <p className="text-destructive text-xs flex items-center gap-1" role="alert">
                  <span className="inline-block w-1 h-1 rounded-full bg-destructive" aria-hidden />
                  {emailError}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
