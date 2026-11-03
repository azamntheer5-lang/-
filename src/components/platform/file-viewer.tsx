"use client";

// عارض الملفات: PDF داخل إطار، صور بعدسة فاخرة (تكبير/سحب)، وتنقل بين الملفات
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  HardDrive,
  Image as ImageIcon,
  Loader2,
  Maximize2,
  Minimize2,
  X,
  ZoomIn,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  apiFetch,
  fileContentUrl,
  FileDTO,
  useServiceFiles,
} from "@/lib/client-api";
import { formatBytes, formatDate } from "@/lib/format";

export interface FileMeta extends FileDTO {
  serviceId: number;
  serviceTitle: string;
}

function isPdfMime(mime: string) {
  return mime === "application/pdf";
}
function isImageMime(mime: string) {
  return mime.startsWith("image/");
}

/* ===== عدسة الصور الفاخرة ===== */
function ImageStage({
  fileId,
  title,
}: {
  fileId: number;
  title: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const moved = useRef(false);

  const toggleZoom = (e: React.MouseEvent<HTMLImageElement>) => {
    if (moved.current) return; // كان سحباً وليس نقرة
    if (zoomed) {
      setZoomed(false);
      setOffset({ x: 0, y: 0 });
    } else {
      const r = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      setOrigin(`${x}% ${y}%`);
      setZoomed(true);
    }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!zoomed) return;
    dragging.current = true;
    setIsDragging(true);
    moved.current = false;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) moved.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLImageElement>) => {
    dragging.current = false;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // تجاهل
    }
    // اسمح بالنقر للتصغير بعد لحظة قصيرة من الإفلات
    window.setTimeout(() => {
      moved.current = false;
    }, 50);
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden p-4 sm:p-8">
      {/* هالة ذهبية خلف الصورة */}
      <div
        className="pointer-events-none absolute inset-0 viewer-backdrop-glow"
        aria-hidden
      />

      <AnimatePresence mode="wait">
        {!loaded && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4"
          >
            <Loader2 className="h-10 w-10 animate-spin text-gold" />
            <p className="text-sm text-muted-foreground">جارٍ تحضير الصورة...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.img
        key={fileId}
        src={fileContentUrl(fileId)}
        alt={title}
        draggable={false}
        onLoad={() => setLoaded(true)}
        onClick={toggleZoom}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        initial={false}
        animate={{
          opacity: loaded ? 1 : 0,
          scale: zoomed ? 2.4 : 1,
          x: offset.x,
          y: offset.y,
        }}
        transition={{ opacity: { duration: 0.45 }, default: { type: "spring", stiffness: 260, damping: 30 } }}
        style={{ transformOrigin: origin }}
        className={`max-h-full max-w-full select-none rounded-2xl border-2 border-gold/40 object-contain shadow-viewer-img ${
          zoomed
            ? isDragging
              ? "cursor-grabbing"
              : "cursor-grab"
            : "cursor-zoom-in"
        }`}
      />

      {/* مؤشر التكبير */}
      {loaded && (
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="pointer-events-none absolute bottom-4 start-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-gold/30 bg-white/90 px-3.5 py-1.5 text-[11px] font-bold text-foreground/75 backdrop-blur-md shadow-lg"
        >
          {zoomed ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          {zoomed ? "اضغط للتصغير — اسحب للتجول" : "اضغط على الصورة للتكبير"}
        </motion.span>
      )}
    </div>
  );
}

/* ===== عرض الـ PDF داخل إطار ===== */
function PdfStage({ fileId, title }: { fileId: number; title: string }) {
  const [frameLoaded, setFrameLoaded] = useState(false);
  return (
    <>
      {!frameLoaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-gold" />
          <p className="text-sm text-muted-foreground">جارٍ تحضير العرض...</p>
        </div>
      )}
      <iframe
        src={fileContentUrl(fileId)}
        title={title}
        onLoad={() => setFrameLoaded(true)}
        className="h-full w-full border-0 bg-white"
      />
    </>
  );
}

/* ===== زر تنقل جانبي ===== */
function NavButton({
  direction,
  onClick,
  label,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  label: string;
}) {
  const Icon = direction === "prev" ? ChevronRight : ChevronLeft;
  const pos = direction === "prev" ? "end-4" : "start-4";
  return (
    <motion.button
      initial={{ opacity: 0, x: direction === "prev" ? 12 : -12 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`absolute ${pos} top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gold/40 bg-white/90 text-gold-deep shadow-viewer-nav backdrop-blur-md transition-colors hover:border-gold/70 hover:bg-gold/15 hover:text-gold-deep`}
    >
      <Icon className="h-6 w-6" />
    </motion.button>
  );
}

/* ===== العارض الرئيسي ===== */
export function FileViewer({
  fileId,
  onClose,
  onNavigate,
}: {
  fileId: number;
  onClose: () => void;
  onNavigate?: (id: number) => void;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["file", fileId],
    queryFn: () => apiFetch<{ file: FileMeta }>(`/api/files/${fileId}`),
  });
  const file = data?.file;

  // قائمة ملفات الخدمة نفسها للتنقل
  const { data: svcData } = useServiceFiles(file?.serviceId ?? null);
  const navFiles = useMemo(() => svcData?.files ?? [], [svcData]);
  const navIndex = navFiles.findIndex((f) => f.id === fileId);
  const prevFile = navIndex > 0 ? navFiles[navIndex - 1] : null;
  const nextFile =
    navIndex >= 0 && navIndex < navFiles.length - 1 ? navFiles[navIndex + 1] : null;

  const isPdf = file ? isPdfMime(file.mimeType) : false;
  const isImage = file ? isImageMime(file.mimeType) : false;

  // إغلاق بزر Escape وتنقل بالأسهم (الاتجاه العربي: اليسار = التالي)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && nextFile && onNavigate) onNavigate(nextFile.id);
      if (e.key === "ArrowRight" && prevFile && onNavigate) onNavigate(prevFile.id);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onNavigate, nextFile, prevFile]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[60] flex flex-col bg-background/97 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label="عارض الملفات"
    >
      {/* الترويسة */}
      <div className="border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/25 bg-gold/10">
            {isImage ? (
              <ImageIcon className="h-5 w-5 text-gold" />
            ) : (
              <FileText className="h-5 w-5 text-gold" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-bold text-foreground sm:text-base">
              {file?.title ?? "جارٍ التحميل..."}
            </h2>
            {file && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {file.serviceTitle}
                {file.description ? ` — ${file.description}` : ""}
              </p>
            )}
          </div>

          {navFiles.length > 1 && navIndex >= 0 && (
            <span className="hidden items-center gap-1.5 rounded-full border border-gold/25 bg-gold/8 px-3 py-1.5 text-[11px] font-bold text-gold-light sm:inline-flex">
              <ZoomIn className="h-3 w-3" />
              {navIndex + 1} من {navFiles.length}
            </span>
          )}

          {file && (
            <div className="flex items-center gap-2">
              <a href={fileContentUrl(file.id, true)} target="_blank" rel="noopener noreferrer">
                <button
                  className="btn-gold inline-flex h-10 items-center gap-1.5 rounded-xl px-4 text-sm font-bold"
                  aria-label="تحميل الملف"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">تحميل</span>
                </button>
              </a>
              <a href={fileContentUrl(file.id)} target="_blank" rel="noopener noreferrer">
                <button
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-gold/25 px-4 text-sm font-bold text-gold-light transition hover:bg-gold/10"
                  aria-label="فتح في تبويب جديد"
                  title="فتح في تبويب جديد"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
              </a>
              <button
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gold/25 text-gold-light transition hover:bg-gold/10"
                aria-label="إغلاق العارض"
                title="إغلاق العارض"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* المحتوى */}
      <div className="relative flex-1 overflow-hidden">
        {isLoading || !file ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
            {isError ? (
              <p>تعذر تحميل الملف — ربما تم حذفه.</p>
            ) : (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-gold" />
                <p className="text-sm">جارٍ فتح الملف...</p>
              </>
            )}
          </div>
        ) : isImage ? (
          /* العدسة الفاخرة — key يعيد ضبط التكبير مع كل صورة */
          <ImageStage key={file.id} fileId={file.id} title={file.title} />
        ) : isPdf ? (
          <PdfStage key={file.id} fileId={file.id} title={file.title} />
        ) : (
          /* مستند آخر: قابل للتحميل فقط */
          <div className="flex h-full flex-col items-center justify-center gap-5 px-4 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-3xl border border-gold/25 bg-gold/10">
              <FileText className="h-10 w-10 text-gold" />
            </span>
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">
                هذا الملف غير قابل للمعاينة داخل المتصفح
              </h3>
              <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">
                يمكنك تحميله وفتحه على جهازك مباشرة.
              </p>
            </div>
            <a href={fileContentUrl(file.id, true)} target="_blank" rel="noopener noreferrer">
              <button className="btn-gold inline-flex h-12 items-center gap-2 rounded-2xl px-8 text-base font-bold">
                <Download className="h-5 w-5" />
                تحميل الملف
              </button>
            </a>
          </div>
        )}

        {/* أزرار التنقل بين ملفات الخدمة */}
        {onNavigate && prevFile && (
          <NavButton
            direction="prev"
            onClick={() => onNavigate(prevFile.id)}
            label={`السابق: ${prevFile.title}`}
          />
        )}
        {onNavigate && nextFile && (
          <NavButton
            direction="next"
            onClick={() => onNavigate(nextFile.id)}
            label={`التالي: ${nextFile.title}`}
          />
        )}
      </div>

      {/* شريط المعلومات */}
      {file && (
        <div className="border-t border-border/60 bg-background/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 py-2.5 text-[11px] text-muted-foreground sm:justify-start sm:px-6">
            <span className="inline-flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5 text-gold/70" />
              الحجم: {formatBytes(file.fileSize)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-gold/70" />
              أُضيف في {formatDate(file.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Download className="h-3.5 w-3.5 text-gold/70" />
              التنزيلات: {file.downloads}
            </span>
            {navFiles.length > 1 && navIndex >= 0 && (
              <span className="sm:hidden">{navIndex + 1} / {navFiles.length}</span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
