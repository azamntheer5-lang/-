import type { Metadata, Viewport } from "next";
import { Amiri, Tajawal } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/platform/providers";

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "أم غلا | خدمات طلابية متكاملة",
  description:
    "منصة أم غلا للخدمات الطلابية المتكاملة: بحوث، ملخصات، عروض تقديمية، حلول كتب، اختبارات، مشاريع تخرج، وترجمة أكاديمية — بجودة عالية وتسليم في الوقت المحدد.",
  keywords: [
    "أم غلا",
    "خدمات طلابية",
    "بحوث",
    "ملخصات",
    "عروض تقديمية",
    "مشاريع تخرج",
    "ترجمة أكاديمية",
  ],
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf7ee",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${amiri.variable} ${tajawal.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <Providers>{children}</Providers>
        <Toaster richColors closeButton position="top-center" />
      </body>
    </html>
  );
}
