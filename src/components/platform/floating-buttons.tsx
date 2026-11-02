"use client";

// أزرار عائمة: زر الخروج الذهبي + زر واتساب
import { motion } from "framer-motion";
import { LogOut, X } from "lucide-react";
import { whatsappLink } from "@/lib/client-api";

/** زر واتساب العائم — يظهر في الرئيسية وقوائم الخدمات */
export function WhatsAppFloat({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <motion.a
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      href={whatsappLink("السلام عليكم، أرغب بالاستفسار عن خدمات أم رهام 🌟")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل عبر واتساب"
      className="group fixed bottom-5 left-5 z-[45] sm:bottom-6 sm:left-6"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25d366]/30" aria-hidden />
      <span className="absolute -inset-1 rounded-full border border-gold/30" aria-hidden />
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] shadow-[0_10px_30px_rgba(37,211,102,0.4)] transition-transform group-hover:scale-110">
        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-black" aria-hidden>
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.85 5.82 2.41a8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24a8.24 8.24 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.26-8.24M8.4 7.26c-.18 0-.46.07-.7.31-.24.25-.92.9-.92 2.19s.94 2.54 1.07 2.72c.13.17 1.82 2.9 4.5 3.93 2.22.87 2.67.7 3.15.65.48-.04 1.55-.63 1.77-1.25.22-.61.22-1.14.15-1.25-.06-.11-.24-.17-.5-.3-.26-.13-1.55-.76-1.79-.85-.24-.09-.42-.13-.59.13-.17.26-.68.85-.83 1.02-.15.18-.3.2-.55.07-.26-.13-1.1-.4-2.08-1.29-.77-.68-1.29-1.53-1.44-1.79-.15-.26-.02-.4.11-.53.13-.13.29-.33.44-.5.15-.17.2-.28.3-.48.09-.19.04-.36-.02-.5-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43l-.48-.01z" />
        </svg>
      </span>
      <span className="pointer-events-none absolute start-full ms-3 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-gold/20 bg-black/85 px-3 py-1.5 text-xs font-bold text-gold-light opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 sm:block">
        تواصل واتساب
      </span>
    </motion.a>
  );
}

/** زر الخروج العائم الذهبي — يخرجك أينما كنت */
export function ExitFloat({
  visible,
  onExit,
  label = "خروج",
}: {
  visible: boolean;
  onExit: () => void;
  label?: string;
}) {
  if (!visible) return null;
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      onClick={onExit}
      aria-label={label}
      title={label}
      className="group fixed bottom-5 right-5 z-[80] flex h-14 w-14 items-center justify-center rounded-full sm:bottom-6 sm:right-6"
      style={{
        background: "linear-gradient(135deg, #f0d68a 0%, #d4a537 50%, #a87f2a 100%)",
        boxShadow: "0 10px 30px rgba(212,165,55,0.45), inset 0 1px 0 rgba(255,255,255,0.4)",
      }}
    >
      {/* هالة ملكية دوّارة */}
      <span
        className="animate-spin-slower pointer-events-none absolute -inset-1.5 rounded-full border border-dashed border-gold/45"
        aria-hidden
      />
      <span className="animate-pulse-gold pointer-events-none absolute inset-0 rounded-full" aria-hidden />
      {label === "خروج" ? (
        <LogOut className="h-6 w-6 text-[#1a1409] transition-transform group-hover:-translate-y-0.5" />
      ) : (
        <X className="h-6 w-6 text-[#1a1409]" />
      )}
      <span className="pointer-events-none absolute end-full me-3 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-gold/20 bg-black/85 px-3 py-1.5 text-xs font-bold text-gold-light opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 sm:block">
        {label}
      </span>
    </motion.button>
  );
}
