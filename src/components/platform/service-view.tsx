"use client";

// مدير ملفات الخدمة: بحث، ترتيب، رفع (للمشرف)، حذف (للمشرف)
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  Download,
  FileText,
  FolderOpen,
  HardDrive,
  Image as ImageIcon,
  ListFilter,
  Loader2,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileDTO,
  apiFetch,
  fileContentUrl,
  useServiceFiles,
} from "@/lib/client-api";
import { formatBytes, formatDate } from "@/lib/format";
import { serviceIcon } from "./icon-map";

type SortKey = "newest" | "oldest" | "alpha" | "largest";

const SORT_LABELS: Record<SortKey, string> = {
  newest: "الأحدث أولاً",
  oldest: "الأقدم أولاً",
  alpha: "أبجدياً",
  largest: "الأكبر حجماً",
};

function isPdf(mime: string) {
  return mime === "application/pdf";
}

function isImage(mime: string) {
  return mime.startsWith("image/");
}

/* ===== بطاقة ملف ===== */
function FileCard({
  file,
  onOpen,
  isAdmin,
  onDelete,
  deleting,
}: {
  file: FileDTO;
  onOpen: (id: number) => void;
  isAdmin: boolean;
  onDelete: (id: number) => void;
  deleting: boolean;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.35 }}
      className="glass-card group relative flex flex-col rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/45 card-hover-glow"
    >
      {isImage(file.mimeType) ? (
        /* بطاقة صورة: معاينة حقيقية أعلى البطاقة */
        <>
          <div
            className="relative mb-4 aspect-[16/10] cursor-pointer overflow-hidden rounded-2xl border border-gold/20 bg-secondary/50"
            onClick={() => onOpen(file.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && onOpen(file.id)}
            aria-label={`فتح ${file.title}`}
          >
            <img
              src={fileContentUrl(file.id)}
              alt={file.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
            <span className="absolute start-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-gold/40 bg-white px-2.5 py-1 text-[10px] font-bold text-gold-deep">
              <ImageIcon className="h-3 w-3" />
              صورة
            </span>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#080706]/70 to-transparent" />
          </div>
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <h3
                className="line-clamp-2 cursor-pointer text-sm font-bold leading-6 text-foreground transition-colors group-hover:text-gold-light"
                onClick={() => onOpen(file.id)}
              >
                {file.title}
              </h3>
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                {file.description || "—"}
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => onDelete(file.id)}
                disabled={deleting}
                aria-label="حذف الملف"
                title="حذف الملف"
                className="shrink-0 rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:bg-destructive/15 hover:text-destructive"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
            )}
          </div>
        </>
      ) : (
        /* بطاقة مستند: أيقونة الملف */
        <div className="flex items-start gap-3.5">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-110 ${
              isPdf(file.mimeType)
                ? "border-gold/25 bg-gradient-to-br from-gold-light/20 to-gold/5"
                : "border-border bg-secondary"
            }`}
          >
            {isPdf(file.mimeType) ? (
              <FileText className="h-6 w-6 text-gold" />
            ) : (
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <h3
              className="line-clamp-2 cursor-pointer text-sm font-bold leading-6 text-foreground transition-colors group-hover:text-gold-light"
              onClick={() => onOpen(file.id)}
            >
              {file.title}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {file.description || "—"}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={() => onDelete(file.id)}
              disabled={deleting}
              aria-label="حذف الملف"
              title="حذف الملف"
              className="rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:bg-destructive/15 hover:text-destructive"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </button>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <HardDrive className="h-3.5 w-3.5 text-gold/60" />
          {formatBytes(file.fileSize)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-gold/60" />
          {formatDate(file.createdAt)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Download className="h-3.5 w-3.5 text-gold/60" />
          {file.downloads}
        </span>
      </div>

      <div className="mt-4 flex gap-2 border-t border-border/50 pt-4">
        <Button
          size="sm"
          onClick={() => onOpen(file.id)}
          className="btn-gold h-9 flex-1 gap-1.5 rounded-xl text-xs font-bold"
        >
          <FileText className="h-3.5 w-3.5" />
          معاينة وفتح
        </Button>
        <a href={fileContentUrl(file.id, true)} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button
            size="sm"
            variant="outline"
            className="h-9 w-full gap-1.5 rounded-xl border-gold/25 text-xs font-bold text-gold-light hover:bg-gold/10 hover:text-gold-light"
          >
            <Download className="h-3.5 w-3.5" />
            تحميل
          </Button>
        </a>
      </div>
    </motion.div>
  );
}

/* ===== واجهة الخدمة ===== */
export function ServiceView({
  serviceId,
  onOpenFile,
  onExit,
  isAdmin,
}: {
  serviceId: number;
  onOpenFile: (id: number) => void;
  onExit: () => void;
  isAdmin: boolean;
}) {
  const { data, isLoading, isError } = useServiceFiles(serviceId);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const service = data?.service;
  const files = data?.files ?? [];
  const Icon = serviceIcon(service?.icon ?? "folder");

  const visibleFiles = useMemo(() => {
    let list = [...files];
    const q = search.trim();
    if (q) {
      list = list.filter(
        (f) => f.title.includes(q) || (f.description ?? "").includes(q)
      );
    }
    switch (sort) {
      case "oldest":
        list.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
        break;
      case "alpha":
        list.sort((a, b) => a.title.localeCompare(b.title, "ar"));
        break;
      case "largest":
        list.sort((a, b) => b.fileSize - a.fileSize);
        break;
      default:
        list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    return list;
  }, [files, search, sort]);

  const handleUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const fd = new FormData();
    Array.from(fileList).forEach((f) => fd.append("files", f));
    setUploading(true);
    try {
      const res = await apiFetch<{ count: number }>(`/api/admin/services/${serviceId}/files`, {
        method: "POST",
        body: fd,
      });
      toast.success(`تم رفع ${res.count} ملف بنجاح ✓`);
      qc.invalidateQueries({ queryKey: ["service-files", serviceId] });
      qc.invalidateQueries({ queryKey: ["services"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الرفع");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (fileId: number) => {
    setDeletingId(fileId);
    try {
      await apiFetch(`/api/admin/files/${fileId}`, { method: "DELETE" });
      toast.success("تم حذف الملف");
      qc.invalidateQueries({ queryKey: ["service-files", serviceId] });
      qc.invalidateQueries({ queryKey: ["services"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الحذف");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12">
      {/* الترويسة */}
      <div className="mb-8">
        <nav className="mb-5 flex items-center gap-1 text-xs text-muted-foreground" aria-label="مسار التنقل">
          <button onClick={onExit} className="transition-colors hover:text-gold-light">
            الرئيسية
          </button>
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="font-bold text-gold-light">{service?.title ?? "..."}</span>
        </nav>

        <div className="glass-card flex flex-col items-start gap-4 rounded-3xl p-6 sm:flex-row sm:items-center">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-gold/25 bg-gradient-to-br from-gold-light/20 to-gold/5">
            <Icon className="h-8 w-8 text-gold" />
          </span>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold sm:text-3xl">
              <span className="text-gold-gradient">{service?.title ?? "جارٍ التحميل..."}</span>
            </h1>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
              {service?.description || "استعرض الملفات أدناه واختر ما يناسبك"}
            </p>
          </div>
          <button
            onClick={onExit}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gold/25 px-4 py-2 text-sm font-bold text-gold-light transition hover:bg-gold/10"
          >
            <ArrowRight className="h-4 w-4" />
            عودة للخدمات
          </button>
        </div>
      </div>

      {/* شريط الأدوات */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/50" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في الملفات..."
            className="h-11 rounded-2xl border-gold/20 bg-secondary/40 ps-10 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-gold/40"
            aria-label="بحث"
          />
        </div>
        <div className="flex items-center gap-2">
          <ListFilter className="hidden h-4 w-4 text-muted-foreground sm:block" />
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-11 w-44 rounded-2xl border-gold/20 bg-secondary/40 text-sm" aria-label="ترتيب">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SORT_LABELS).map(([k, label]) => (
                <SelectItem key={k} value={k}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isAdmin && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.png,.jpg,.jpeg,.webp"
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
                aria-hidden
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn-gold h-11 gap-2 rounded-2xl px-5 text-sm font-bold"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                رفع ملفات
              </Button>
            </>
          )}
        </div>
      </div>

      {/* العدد */}
      <p className="mb-4 text-xs text-muted-foreground">
        {isLoading ? "جارٍ التحميل..." : `${visibleFiles.length} ملف معروض من ${files.length}`}
      </p>

      {/* الشبكة */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-3xl bg-black/[0.06]" />
          ))}
        </div>
      ) : isError ? (
        <div className="glass-card mx-auto max-w-md rounded-3xl p-8 text-center text-muted-foreground">
          تعذر تحميل الملفات، حدّث الصفحة وأعد المحاولة.
        </div>
      ) : visibleFiles.length === 0 ? (
        <div className="glass-card mx-auto max-w-md rounded-3xl p-10 text-center">
          <FolderOpen className="mx-auto mb-4 h-14 w-14 text-gold/40" />
          <h3 className="font-display text-xl font-bold text-foreground">
            {search ? "لا توجد نتائج مطابقة" : "لا توجد ملفات بعد"}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {search
              ? "جرّب كلمات بحث أخرى"
              : isAdmin
                ? "ارفع أول ملف من زر «رفع ملفات» بالأعلى"
                : "ستُضاف الملفات قريباً — تابعنا"}
          </p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleFiles.map((f) => (
            <FileCard
              key={f.id}
              file={f}
              onOpen={onOpenFile}
              isAdmin={isAdmin}
              onDelete={handleDelete}
              deleting={deletingId === f.id}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
