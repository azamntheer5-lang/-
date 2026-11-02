"use client";

// الواجهة الرئيسية: البطل + الخدمات + المعرض + التواصل
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronDown,
  FileText,
  Images,
  MessageCircle,
  Phone,
  Sparkles,
  Star,
  Wallet,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ServiceDTO,
  SiteImageDTO,
  imageUrl,
  useServices,
  useSiteImages,
  WHATSAPP_DISPLAY,
  whatsappLink,
} from "@/lib/client-api";
import { serviceIcon } from "./icon-map";

interface HomeViewProps {
  onOpenService: (id: number) => void;
}

/* ================= قسم البطل ================= */

function HeroSection({ services }: { services: ServiceDTO[] }) {
  const { data: images } = useSiteImages();
  const hero = images?.hero;
  const totalFiles = services.reduce((sum, s) => sum + s.filesCount, 0);

  return (
    <section className="relative overflow-hidden">
      {/* خلفيات زخرفية */}
      <div className="bg-arabesque pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute -top-40 start-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full opacity-25 blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(212,165,55,0.55), transparent 65%)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -start-24 h-72 w-72 rounded-full opacity-15 blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(212,165,55,0.5), transparent 65%)" }}
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-12 sm:px-6 md:pt-16 lg:grid-cols-[1.15fr_1fr] lg:gap-8 lg:pb-28">
        {/* النص التعريفي */}
        <div className="text-center lg:text-start">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/5 px-4 py-1.5 text-sm text-gold-light lg:mx-0"
          >
            <Sparkles className="h-4 w-4" />
            منصة تعليمية موثوقة — خدمة تدعم طالبك من الألف إلى الياء
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-6xl font-bold leading-[1.15] sm:text-7xl lg:text-8xl"
          >
            <span className="text-gold-gradient">أم رهام</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-display mt-3 text-2xl font-bold text-foreground/90 sm:text-3xl"
          >
            خدمات طلابية متكاملة
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mx-auto mt-5 max-w-xl text-base leading-8 text-muted-foreground sm:text-lg lg:mx-0"
          >
            بحوث وملخصات وعروض تقديمية وحلول ومشاريع تخرج وترجمة أكاديمية — إعداد
            متقن، تنسيق أنيق، وتسليم في الوقت المحدد. تصفّح الخدمات أدناه وحمّل ما
            يناسبك مباشرة، أو راسلنا لطلب خدمة خاصة.
          </motion.p>

          {/* الأزرار */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            <a href="#services">
              <Button size="lg" className="btn-gold h-12 gap-2 rounded-2xl px-7 text-base font-bold">
                تصفّح الخدمات
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </a>
            <a
              href={whatsappLink("السلام عليكم، أرغب بالاستفسار عن خدمات أم رهام الطلابية 🌟")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="h-12 gap-2 rounded-2xl border-gold/30 bg-transparent px-7 text-base font-bold text-gold-light hover:bg-gold/10 hover:text-gold-light"
              >
                <MessageCircle className="h-5 w-5" />
                اطلب عبر واتساب
              </Button>
            </a>
          </motion.div>

          {/* إحصائيات */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-10 grid max-w-md grid-cols-3 gap-3 max-lg:mx-auto"
          >
            {[
              { value: `${services.length || 7}+`, label: "خدمة متكاملة", icon: Star },
              { value: `${totalFiles || 9}+`, label: "ملف جاهز للتحميل", icon: FileText },
              { value: "24/7", label: "استجابة واتساب", icon: Phone },
            ].map((s) => (
              <div
                key={s.label}
                className="glass-card rounded-2xl px-3 py-4 text-center"
              >
                <s.icon className="mx-auto mb-1.5 h-4 w-4 text-gold" />
                <div className="font-display text-xl font-bold text-gold-light">{s.value}</div>
                <div className="mt-0.5 text-[11px] font-medium text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* صورة البطل بإطار القوس */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="relative mx-auto w-full max-w-[340px] sm:max-w-[400px]"
        >
          {/* حلقة دوّارة زخرفية */}
          <div
            className="animate-spin-slower absolute -inset-6 rounded-full border border-dashed border-gold/25 sm:-inset-8"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 blur-2xl"
            style={{ background: "radial-gradient(circle at 50% 30%, rgba(212,165,55,0.35), transparent 60%)" }}
            aria-hidden
          />

          {/* الإطار */}
          <div className="gold-glow arch-frame relative overflow-hidden border-2 border-gold/50 bg-surface p-1.5">
            <div className="arch-frame relative overflow-hidden">
              {hero ? (
                <img
                  src={imageUrl(hero.id)}
                  alt="أم رهام — خدمات طلابية متكاملة"
                  className="arch-frame h-[420px] w-full object-cover sm:h-[500px]"
                />
              ) : (
                <div className="arch-frame flex h-[420px] w-full items-center justify-center bg-gradient-to-b from-gold/15 to-transparent sm:h-[500px]">
                  <Star className="h-16 w-16 text-gold/40" />
                </div>
              )}
              {/* تدرج سفلي */}
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent"
                aria-hidden
              />
              <div className="absolute bottom-4 start-1/2 w-max -translate-x-1/2">
                <span className="font-display rounded-full border border-gold/30 bg-black/45 px-5 py-1.5 text-lg font-bold text-gold-light backdrop-blur-md">
                  أم رهام ✦ بخدماتها ترتقي
                </span>
              </div>
            </div>
          </div>

          {/* شارات عائمة */}
          <div className="animate-float-slow glass-card absolute -top-3 -start-4 flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 sm:-start-8">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15">
              <FileText className="h-4.5 w-4.5 text-gold" />
            </span>
            <span>
              <span className="block text-xs font-bold text-foreground">بحوث وملخصات</span>
              <span className="block text-[11px] text-muted-foreground">جاهزة للتحميل</span>
            </span>
          </div>
          <div className="animate-float-slower glass-card absolute -bottom-4 -end-3 flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 sm:-end-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/15">
              <Wallet className="h-4.5 w-4.5 text-gold" />
            </span>
            <span>
              <span className="block text-xs font-bold text-foreground">أسعار مناسبة</span>
              <span className="block text-[11px] text-muted-foreground">تسليم في الموعد</span>
            </span>
          </div>
        </motion.div>
      </div>

      {/* سهم لأسفل */}
      <div className="relative flex justify-center pb-6">
        <a href="#services" aria-label="انتقل إلى الخدمات">
          <ChevronDown className="animate-bounce h-6 w-6 text-gold/60" />
        </a>
      </div>
    </section>
  );
}

/* ================= عنوان قسم ================= */

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-10 text-center">
      <h2 className="font-display text-3xl font-bold sm:text-4xl">
        <span className="text-gold-gradient">{title}</span>
      </h2>
      <div className="mt-4 flex items-center justify-center gap-3">
        <span className="ornament-line w-16 sm:w-24" />
        <Star className="h-4 w-4 text-gold" />
        <span className="ornament-line w-16 sm:w-24" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground sm:text-base">{subtitle}</p>
    </div>
  );
}

/* ================= شبكة الخدمات ================= */

function ServicesGrid({ onOpenService }: { onOpenService: (id: number) => void }) {
  const { data: services, isLoading, error } = useServices();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-3xl bg-white/[0.04]" />
        ))}
      </div>
    );
  }

  if (error || !services) {
    return (
      <div className="glass-card mx-auto max-w-md rounded-3xl p-8 text-center">
        <p className="text-muted-foreground">تعذر تحميل الخدمات، حدّث الصفحة وأعد المحاولة.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {services.map((service, i) => {
        const Icon = serviceIcon(service.icon);
        return (
          <motion.button
            key={service.id}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
            onClick={() => onOpenService(service.id)}
            className="glass-card group relative overflow-hidden rounded-3xl p-6 text-start transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/45 hover:shadow-[0_18px_50px_-12px_rgba(212,165,55,0.28)]"
          >
            {/* لمعة الخلفية عند التحويم */}
            <div
              className="pointer-events-none absolute -top-16 -end-16 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
              style={{ background: "radial-gradient(circle, rgba(212,165,55,0.35), transparent 70%)" }}
              aria-hidden
            />

            <div className="relative">
              <div className="mb-4 flex items-start justify-between">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/25 bg-gradient-to-br from-gold-light/20 to-gold/5 shadow-[0_8px_24px_rgba(212,165,55,0.15)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Icon className="h-7 w-7 text-gold" />
                </span>
                {service.filesCount > 0 && (
                  <span className="rounded-full border border-gold/25 bg-gold/10 px-2.5 py-1 text-[11px] font-bold text-gold-light">
                    {service.filesCount} ملف
                  </span>
                )}
              </div>
              <h3 className="font-display text-xl font-bold text-foreground transition-colors group-hover:text-gold-light">
                {service.title}
              </h3>
              {service.description && (
                <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-6 text-muted-foreground">
                  {service.description}
                </p>
              )}
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-gold/80 transition-all group-hover:gap-3 group-hover:text-gold">
                استعراض الملفات
                <ArrowLeft className="h-4 w-4" />
              </span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

/* ================= المعرض ================= */

function GallerySection() {
  const { data } = useSiteImages();
  const gallery = data?.gallery ?? [];
  const [lightbox, setLightbox] = useState<SiteImageDTO | null>(null);

  if (gallery.length === 0) return null;

  return (
    <section id="gallery" className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6">
      <SectionTitle
        title="معرض الأعمال"
        subtitle="لمحات من أعمالنا وإنجازاتنا — دائماً في تجدد"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
        {gallery.map((img, i) => (
          <motion.button
            key={img.id}
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: (i % 4) * 0.06 }}
            onClick={() => setLightbox(img)}
            className="group relative aspect-square overflow-hidden rounded-2xl border border-border/70"
            aria-label={img.title || "صورة من المعرض"}
          >
            <img
              src={imageUrl(img.id)}
              alt={img.title || "صورة من معرض أعمال أم رهام"}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            {img.title && (
              <span className="absolute bottom-2.5 start-3 end-3 truncate text-start text-xs font-bold text-gold-light opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {img.title}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      {/* العارض المكبّر */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-h-[85vh] max-w-4xl"
          >
            <img
              src={imageUrl(lightbox.id)}
              alt={lightbox.title || "صورة مكبرة"}
              className="max-h-[85vh] w-auto rounded-2xl border border-gold/30 gold-glow"
            />
            {lightbox.title && (
              <p className="mt-3 text-center text-sm font-bold text-gold-light">{lightbox.title}</p>
            )}
          </motion.div>
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-5 end-5 rounded-full border border-gold/30 bg-black/60 p-2.5 text-gold-light transition hover:bg-gold/20"
            aria-label="إغلاق العارض"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </section>
  );
}

/* ================= التواصل ================= */

function ContactSection() {
  return (
    <section id="contact" className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6">
      <SectionTitle
        title="تواصل معنا"
        subtitle="فريق أم رهام جاهز للرد على استفساراتك وطلباتك في أي وقت"
      />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass-card relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] p-8 text-center sm:p-10"
      >
        <div className="bg-arabesque pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative">
          <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#25d366]/15">
            <MessageCircle className="h-8 w-8 text-[#25d366]" />
          </span>
          <h3 className="font-display text-2xl font-bold text-foreground">
            اطلب خدمتك عبر واتساب
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">
            أرسل تفاصيل طلبك (نوع الخدمة، المادة، الموعد المطلوب) وسنرد عليك
            بسرعة مع السعر ومدة التنفيذ.
          </p>
          <div className="mt-6 font-display flex items-center justify-center gap-3" dir="ltr">
            <Phone className="h-5 w-5 text-gold" />
            <span className="text-3xl font-bold tracking-wider text-gold-gradient">
              {WHATSAPP_DISPLAY}
            </span>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href={whatsappLink("السلام عليكم، أرغب بطلب خدمة طلابية 🌟")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" className="h-12 gap-2 rounded-2xl bg-[#25d366] px-8 text-base font-bold text-black hover:bg-[#22c45c]">
                <MessageCircle className="h-5 w-5" />
                إرسال رسالة الآن
              </Button>
            </a>
            <a href={`tel:+${WHATSAPP_DISPLAY}`}>
              <Button
                size="lg"
                variant="outline"
                className="h-12 gap-2 rounded-2xl border-gold/30 bg-transparent px-8 text-base font-bold text-gold-light hover:bg-gold/10"
              >
                <Phone className="h-5 w-5" />
                اتصال مباشر
              </Button>
            </a>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            متواجدين على مدار الساعة — استجابتك تصلك خلال دقائق بإذن الله
          </p>
        </div>
      </motion.div>
    </section>
  );
}

/* ================= الواجهة ================= */

export function HomeView({ onOpenService }: HomeViewProps) {
  const { data: services } = useServices();

  return (
    <>
      <HeroSection services={services ?? []} />

      <section id="services" className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6">
        <SectionTitle
          title="خدماتنا"
          subtitle="اختر خدمتك — كل خدمة تحتوي على ملفات جاهزة للمعاينة والتحميل"
        />
        <ServicesGrid onOpenService={onOpenService} />

        {/* شريط المزايا */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {[
            { icon: FileText, title: "جودة أكاديمية", desc: "إعداد متقن وفق المعايير الجامعية" },
            { icon: Sparkles, title: "تنسيق أنيق", desc: "تنسيق احترافي لكل ملف قبل التسليم" },
            { icon: Images, title: "تحديث مستمر", desc: "ملفات وقوالب تضاف باستمرار للمنصة" },
          ].map((f) => (
            <div key={f.title} className="glass-card flex items-center gap-4 rounded-2xl p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold/12">
                <f.icon className="h-6 w-6 text-gold" />
              </span>
              <span>
                <span className="block font-bold text-foreground">{f.title}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{f.desc}</span>
              </span>
            </div>
          ))}
        </motion.div>
      </section>

      <GallerySection />
      <ContactSection />
    </>
  );
}
