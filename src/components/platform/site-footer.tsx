"use client";

// التذييل الثابت أسفل الصفحة
import { Heart, Lock, Sparkle } from "lucide-react";
import { WHATSAPP_DISPLAY, whatsappLink } from "@/lib/client-api";

interface SiteFooterProps {
  onAdmin: () => void;
  onOpenService: (id: number) => void;
}

export function SiteFooter({ onAdmin }: SiteFooterProps) {
  return (
    <footer className="mt-auto border-t border-gold/20 bg-[#f3ecdb]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {/* الهوية */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/30 bg-gradient-to-br from-gold-light/25 to-gold/5">
                <Sparkle className="h-4.5 w-4.5 text-gold" />
              </span>
              <div className="leading-tight">
                <span className="font-display block text-lg font-bold text-gold-gradient">أم غلا</span>
                <span className="block text-[11px] text-muted-foreground">خدمات طلابية متكاملة</span>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
              منصة متخصصة في دعم الطلاب: بحوث، ملخصات، عروض، حلول، ومشاريع تخرج
              بجودة عالية وأسعار مناسبة.
            </p>
          </div>

          {/* روابط سريعة */}
          <div>
            <h4 className="font-display mb-4 text-base font-bold text-gold-light">روابط سريعة</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#services" className="text-muted-foreground transition-colors hover:text-gold-light">
                  الخدمات
                </a>
              </li>
              <li>
                <a href="#gallery" className="text-muted-foreground transition-colors hover:text-gold-light">
                  معرض الأعمال
                </a>
              </li>
              <li>
                <a href="#contact" className="text-muted-foreground transition-colors hover:text-gold-light">
                  تواصل معنا
                </a>
              </li>
            </ul>
          </div>

          {/* التواصل */}
          <div>
            <h4 className="font-display mb-4 text-base font-bold text-gold-light">تواصل مباشر</h4>
            <a
              href={whatsappLink("السلام عليكم 🌟")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-gold/25 bg-gold/5 px-4 py-2.5 text-sm font-bold text-gold-light transition hover:bg-gold/15"
              dir="ltr"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-[#25d366]" aria-hidden>
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.85 5.82 2.41a8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24a8.24 8.24 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.26-8.24M8.4 7.26c-.18 0-.46.07-.7.31-.24.25-.92.9-.92 2.19s.94 2.54 1.07 2.72c.13.17 1.82 2.9 4.5 3.93 2.22.87 2.67.7 3.15.65.48-.04 1.55-.63 1.77-1.25.22-.61.22-1.14.15-1.25-.06-.11-.24-.17-.5-.3-.26-.13-1.55-.76-1.79-.85-.24-.09-.42-.13-.59.13-.17.26-.68.85-.83 1.02-.15.18-.3.2-.55.07-.26-.13-1.1-.4-2.08-1.29-.77-.68-1.29-1.53-1.44-1.79-.15-.26-.02-.4.11-.53.13-.13.29-.33.44-.5.15-.17.2-.28.3-.48.09-.19.04-.36-.02-.5-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43l-.48-.01z" />
              </svg>
              {WHATSAPP_DISPLAY}
            </a>
            <p className="mt-3 text-xs text-muted-foreground">
              واتساب فقط — نرد بسرعة خلال دقائق بإذن الله
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} أم غلا — جميع الحقوق محفوظة
          </p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              صُنعت بـ
              <Heart className="h-3.5 w-3.5 fill-gold text-gold" />
              لخدمة الطلاب
            </span>
            <button
              onClick={onAdmin}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground/70 transition-colors hover:text-gold-light"
              aria-label="لوحة التحكم"
              title="لوحة التحكم"
            >
              <Lock className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
