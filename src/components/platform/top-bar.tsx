"use client";

// الشريط العلوي: الهوية + روابط سريعة + زر دخول المشرف
import { Lock, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  onHome: () => void;
  onAdmin: () => void;
  isAdmin: boolean;
  hideNav?: boolean;
}

const NAV_LINKS = [
  { href: "#services", label: "الخدمات" },
  { href: "#gallery", label: "المعرض" },
  { href: "#contact", label: "تواصل معنا" },
];

export function TopBar({ onHome, onAdmin, isAdmin }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* الهوية */}
        <button
          onClick={onHome}
          className="group flex items-center gap-2.5 text-start"
          aria-label="العودة إلى الرئيسية"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/30 bg-gradient-to-br from-gold-light/25 to-gold/5 shadow-[0_0_18px_rgba(212,165,55,0.25)]">
            <Sparkle className="h-4.5 w-4.5 text-gold" />
          </span>
          <span className="leading-tight">
            <span className="font-display block text-lg font-bold text-gold-gradient">أم رهام</span>
            <span className="block text-[11px] font-medium text-muted-foreground">
              خدمات طلابية متكاملة
            </span>
          </span>
        </button>

        {/* روابط التنقل */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="روابط الصفحة">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-gold-light"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* زر المشرف */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onAdmin}
          aria-label="لوحة التحكم"
          title="لوحة التحكم"
          className={`gap-1.5 rounded-xl text-muted-foreground hover:text-gold-light ${
            isAdmin ? "border border-gold/40 text-gold" : ""
          }`}
        >
          <Lock className="h-4 w-4" />
          <span className="hidden sm:inline text-xs">{isAdmin ? "المشرف متصل" : "التحكم"}</span>
        </Button>
      </div>
    </header>
  );
}
