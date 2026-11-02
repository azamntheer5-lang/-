"use client";

// عارض الملفات: يفتح فوق الصفحة بحجم كامل مع زر خروج عائم
import { motion } from "framer-motion";
import {
  Calendar,
  Download,
  ExternalLink,
  FileText,
  HardDrive,
  Loader2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  apiFetch,
  fileContentUrl,
  FileDTO,
} from "@/lib/client-api";
import { formatBytes, formatDate } from "@/lib/format";

export interface FileMeta extends FileDTO {
  serviceTitle: string;
}

export function FileViewer({
  fileId,
  onClose,
}: {
  fileId: number;
  onClose: () => void;
}) {
  const [frameLoaded, setFrameLoaded] = useState(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["file", fileId],
    queryFn: () => apiFetch<{ file: FileMeta }>(`/api/files/${fileId}`),
  });
  const file = data?.file;
  const isPdf = file ? file.mimeType === "application/pdf" : true;

  // إغلاق بزر Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[60] flex flex-col bg-[#080706]/97 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label="عارض الملفات"
    >
      {/* الترويسة */}
      <div className="border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/25 bg-gold/10">
            <FileText className="h-5 w-5 text-gold" />
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
        ) : isPdf ? (
          <>
            {!frameLoaded && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-gold" />
                <p className="text-sm text-muted-foreground">جارٍ تحضير العرض...</p>
              </div>
            )}
            <iframe
              src={fileContentUrl(file.id)}
              title={file.title}
              onLoad={() => setFrameLoaded(true)}
              className="h-full w-full border-0 bg-[#141414]"
            />
          </>
        ) : (
          /* ملف غير PDF: لا يمكن معاينته داخل المتصفح */
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
          </div>
        </div>
      )}
    </motion.div>
  );
}
