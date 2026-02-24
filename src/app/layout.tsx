import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ConditionalChrome } from "@/components/ConditionalChrome";
import { Toaster } from "sonner";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0052CC",
};

export const metadata: Metadata = {
  title: "단체복 목업 | 맞춤 제작 문의",
  description: "단체복 디자인 목업을 만들고 제작 문의를 보내보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
        <ConditionalChrome />
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
