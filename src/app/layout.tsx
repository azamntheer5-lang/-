import type { Metadata, Viewport } from "next";
import { Amiri, Tajawal } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/platform/providers";
import { db } from "@/lib/db";
import {
  DEFAULT_THEME_ID,
  THEME_SETTING_KEY,
  findTheme,
  themeCssMap,
  themeCssText,
} from "@/lib/themes";

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
    icon: "/api/theme/icon",
  },
};

export const viewport: Viewport = {
  themeColor: "#f2ede0",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // لون الهوية المختار يُحقن من الخادم قبل الرسم — بلا أي وميض
  let theme = findTheme(DEFAULT_THEME_ID);
  try {
    const row = await db.setting.findUnique({ where: { key: THEME_SETTING_KEY } });
    if (row?.value) theme = findTheme(row.value);
  } catch {
    // قاعدة البيانات غير متاحة؟ نستخدم اللوحة الافتراضية
  }

  const serverVars = `:root{${themeCssText(theme)}}`;
  const bootScript = `window.__SITE_THEMES__=${JSON.stringify(themeCssMap())};(function(){try{var t=localStorage.getItem("siteTheme");var m=window.__SITE_THEMES__;if(t&&m[t]){document.documentElement.style.cssText=m[t];}}catch(e){}})();`;

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${amiri.variable} ${tajawal.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <style
          id="site-theme-vars"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: serverVars }}
        />
        <script
          id="site-theme-boot"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: bootScript }}
        />
        <Providers>{children}</Providers>
        <Toaster richColors closeButton position="top-center" />
      </body>
    </html>
  );
}
