"use client";

// منتقي لون الهوية — 8 لوحات فاخرة تتغير فوراً
import { Check, Palette } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { applySiteTheme, saveSiteTheme, useSiteTheme } from "@/lib/client-api";
import { DEFAULT_THEME_ID, THEMES } from "@/lib/themes";

/** ألوان معاينة اللوحة (4 نقاط: الغامق، الأساسي، المضيء، الفاتح) */
function swatchColors(themeId: string): string[] {
  const t = THEMES.find((x) => x.id === themeId)!;
  return [t.vars["--gold-deep"], t.vars["--gold"], t.vars["--gold-bright"], t.vars["--gold-pale"]];
}

export function ThemePicker({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  // اللون الذي اختاره المستخدم في هذه الجلسة + المحفوظ على جهازه
  const [picked, setPicked] = useState<string | null>(null);
  const [stored, setStored] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const { data } = useSiteTheme();

  const activeThemeId = picked ?? stored ?? data?.themeId ?? DEFAULT_THEME_ID;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      try {
        setStored(localStorage.getItem("siteTheme"));
      } catch {
        setStored(null);
      }
    }
  };

  const pick = async (themeId: string) => {
    setPicked(themeId);
    applySiteTheme(themeId);

    if (!isAdmin) {
      // زائرة: التطبيق على جهازها فقط
      try {
        localStorage.setItem("siteTheme", themeId);
      } catch {
        /* تجاهل */
      }
      toast.success("تم تغيير لون الموقع على جهازك 🎨");
      setOpen(false);
      return;
    }

    // المشرفة: يُحفظ لجميع الزوار
    setSaving(true);
    try {
      await saveSiteTheme(themeId);
      try {
        localStorage.removeItem("siteTheme");
      } catch {
        /* تجاهل */
      }
      toast.success("تم حفظ اللون لجميع الزوار 🎨", {
        description: "اضغطي «نشر التحديثات» من لوحة التحكم ليظهر على النسخة المنشورة",
      });
      setOpen(false);
    } catch {
      // ليس مشرفة فعلياً — نطبّق محلياً
      try {
        localStorage.setItem("siteTheme", themeId);
      } catch {
        /* تجاهل */
      }
      toast.info("تم التطبيق على جهازك فقط — سجّلي الدخول كمشرفة للحفظ للجميع");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="تغيير لون الموقع"
          title="تغيير لون الموقع"
          className="relative h-9 w-9 rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-gold-light"
        >
          <Palette className="h-4.5 w-4.5" />
          {/* نقطة لون اللوحة الحالية */}
          <span
            className="absolute bottom-1.5 end-1.5 h-2 w-2 rounded-full border border-background"
            style={{ background: `var(--gold)` }}
            aria-hidden
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="end"
        className="w-80 rounded-2xl border-gold/20 p-4"
        dir="rtl"
      >
        <div className="mb-1 flex items-center gap-2">
          <Palette className="h-4 w-4 text-gold" />
          <h3 className="font-display text-base font-bold text-foreground">لون الموقع</h3>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          {isAdmin
            ? "اختيارك يُحفظ لجميع الزوار فوراً"
            : "جرّبي الألوان على جهازك — الحفظ للجميع للمشرفة"}
        </p>

        <div className="scrollbar-thin grid max-h-72 grid-cols-2 gap-2 overflow-y-auto">
          {THEMES.map((theme) => {
            const active = theme.id === activeThemeId;
            return (
              <button
                key={theme.id}
                onClick={() => pick(theme.id)}
                disabled={saving}
                aria-pressed={active}
                className={`group relative flex items-center gap-2.5 rounded-xl border p-2.5 text-start transition-all duration-200 hover:-translate-y-0.5 ${
                  active
                    ? "border-gold bg-gold/10 shadow-active-chip"
                    : "border-border/70 bg-secondary/40 hover:border-gold/40"
                } ${saving ? "cursor-wait opacity-70" : ""}`}
              >
                <span className="flex shrink-0 -space-x-1.5">
                  {swatchColors(theme.id).map((c, i) => (
                    <span
                      key={i}
                      className="h-5 w-5 rounded-full border-2 border-white shadow-sm"
                      style={{ background: c }}
                      aria-hidden
                    />
                  ))}
                </span>
                <span className="flex-1 text-xs font-bold text-foreground">{theme.name}</span>
                {active && <Check className="h-4 w-4 shrink-0 text-gold" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
