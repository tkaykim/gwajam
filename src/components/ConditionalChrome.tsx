"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { FloatingMenu } from "@/components/FloatingMenu";

export function ConditionalChrome() {
  const pathname = usePathname();
  const isOnboarding = pathname === "/onboarding";

  if (isOnboarding) return null;

  return (
    <>
      <Footer />
      <FloatingMenu />
    </>
  );
}
