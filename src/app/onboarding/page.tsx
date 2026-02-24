"use client";

import { useRouter } from "next/navigation";
import { Onboarding } from "@/components/Onboarding";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <Onboarding
      onComplete={() => {
        router.replace("/");
      }}
    />
  );
}
