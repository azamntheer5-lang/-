"use client";

// إدارة ملفات الخدمات: رفع بالسحب والإفلات، إعادة تسمية، حذف
import { CloudUpload, Download, FileText, Loader2, Pencil, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch, fileContentUrl, useServiceFiles, useServices } from "@/lib/client-api";
import { formatBytes, formatDate } from "@/lib/format";

export function FilesManager() {
  const { data: services } = useServices();
  const [serviceId, setServiceId] = useState<number | null>(null);
  const activeId = serviceId ?? services?.[0]?.id ?? null;
  const { data, isLoading } = useServiceFiles(activeId);
  const qc = useQueryClient();

  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const [renaming, setRenaming] = useState<{ id: number; title: string; description: string } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  /** رفع مع تتبّع التقدم عبر XHR */
  const uploadFiles = (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0 || !activeId) return;
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    setUploading(true);
    setProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/admin/services/${activeId}/files`);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      setUploading(false);
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          toast.success(`تم رفع ${res.count} ملف بنجاح ✓`);
          qc.invalidateQueries({ queryKey: ["service-files", activeId] });
          qc.invalidateQueries({ queryKey: ["services"] });
        } else {
          toast.error(res.error || "فشل الرفع");
        }
      } catch {
        toast.error("فشل الرفع");
      }
    };
    xhr.onerror = () => {
      setUploading(false);
      toast.error("انقطع الاتصال أثناء الرفع");
    };
    xhr.send(fd);
  };

  const saveRename = async () => {
    if (!renaming) return;
    setBusy(true);
    try {
      await apiFetch(`/api/admin/files/${renaming.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: renaming.title, description: renaming.description }),
      });
      toast.success("تم الحفظ ✓");
      if (activeId) qc.invalidateQueries({ queryKey: ["service-files", activeId] });
      setRenaming(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "تعذر الحفظ");
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (deletingId === null || activeId === null) return;
    setBusy(true);
    try {
      await apiFetch(`/api/admin/files/${deletingId}`, { method: "DELETE" });
      toast.success("تم حذف الملف");
      qc.invalidateQueries({ queryKey: ["service-files", activeId] });
      qc.invalidateQueries({ queryKey: ["services"] });
      setDeletingId(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "تعذر الحذف");
    } finally {
      setBusy(false);
    }
  };

  const files = data?.files ?? [];

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <h2 className="font-display text-lg font-bold text-foreground">إدارة الملفات</h2>
        {services && services.length > 0 && (
          <Select
            value={String(activeId)}
            onValueChange={(v) => setServiceId(Number(v))}
          >
            <SelectTrigger className="h-11 w-64 rounded-2xl border-gold/20 bg-secondary/40 text-sm">
              <SelectValue placeholder="اختر الخدمة" />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.title} ({s.filesCount})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {services?.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 text-center text-sm text-muted-foreground">
          أضف خدمة أولاً من تبويب «الخدمات» ثم ارجع لرفع الملفات.
        </div>
      ) : !activeId ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : (
        <>
          {/* منطقة الرفع */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              if (!uploading) uploadFiles(e.dataTransfer.files);
            }}
            onClick={() => !uploading && inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && !uploading && inputRef.current?.click()}
            aria-label="منطقة رفع الملفات — اسحب الملفات هنا أو اضغط للاختيار"
            className={`mb-6 cursor-pointer rounded-3xl border-2 border-dashed p-10 text-center transition-all ${
              dragging
                ? "border-gold bg-gold/10"
                : "border-gold/25 bg-secondary/20 hover:border-gold/50 hover:bg-gold/5"
            } ${uploading ? "pointer-events-none opacity-80" : ""}`}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) uploadFiles(e.target.files);
                e.target.value = "";
              }}
              aria-hidden
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-gold" />
                <p className="text-sm font-bold text-gold-light">جارٍ الرفع... {progress}%</p>
                <div className="h-2 w-56 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-gold-light to-gold transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <span className="flex h-16 w-16 items-center justify-center rounded-3xl border border-gold/25 bg-gold/10">
                  <CloudUpload className="h-8 w-8 text-gold" />
                </span>
                <p className="text-sm font-bold text-foreground">
                  اسحب الملفات إلى هنا أو اضغط للاختيار
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF و Word و PowerPoint و صور — يمكن رفع عدة ملفات معاً (حتى 300MB للملف)
                </p>
              </div>
            )}
          </div>

          {/* قائمة الملفات */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
            </div>
          ) : files.length === 0 ? (
            <div className="glass-card rounded-3xl p-10 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-gold/40" />
              <p className="text-sm text-muted-foreground">لا توجد ملفات في هذه الخدمة بعد</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {files.map((f) => (
                <div key={f.id} className="glass-card flex items-center gap-3.5 rounded-2xl p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/25 bg-gold/10">
                    <FileText className="h-5 w-5 text-gold" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-foreground">{f.title}</h3>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {formatBytes(f.fileSize)} • {formatDate(f.createdAt)} • {f.downloads} تنزيل
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <a
                      href={fileContentUrl(f.id, true)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-gold/10 hover:text-gold-light"
                      title="تحميل"
                      aria-label="تحميل الملف"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() =>
                        setRenaming({ id: f.id, title: f.title, description: f.description })
                      }
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-gold/10 hover:text-gold-light"
                      title="تعديل الاسم"
                      aria-label="تعديل الاسم"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingId(f.id)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                      title="حذف"
                      aria-label="حذف الملف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* حوار إعادة التسمية */}
      <Dialog open={!!renaming} onOpenChange={(v) => !v && setRenaming(null)}>
        <DialogContent dir="rtl" aria-describedby={undefined} className="max-w-md rounded-3xl border-gold/20 bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold text-gold-gradient">
              تعديل بيانات الملف
            </DialogTitle>
          </DialogHeader>
          {renaming && (
            <div className="space-y-4 py-2">
              <div>
                <label className="mb-1.5 block text-sm font-bold" htmlFor="file-title">
                  اسم الملف
                </label>
                <Input
                  id="file-title"
                  value={renaming.title}
                  onChange={(e) => setRenaming((r) => (r ? { ...r, title: e.target.value } : r))}
                  className="h-11 rounded-xl border-gold/20 bg-secondary/40"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-bold" htmlFor="file-desc">
                  الوصف (اختياري)
                </label>
                <Input
                  id="file-desc"
                  value={renaming.description}
                  onChange={(e) => setRenaming((r) => (r ? { ...r, description: e.target.value } : r))}
                  className="h-11 rounded-xl border-gold/20 bg-secondary/40"
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-border/50 pt-4">
                <Button variant="outline" onClick={() => setRenaming(null)} className="rounded-xl">
                  إلغاء
                </Button>
                <Button onClick={saveRename} disabled={busy} className="btn-gold gap-2 rounded-xl font-bold">
                  {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                  حفظ
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* تأكيد الحذف */}
      <AlertDialog open={deletingId !== null} onOpenChange={(v) => !v && setDeletingId(null)}>
        <AlertDialogContent dir="rtl" aria-describedby={undefined} className="rounded-3xl border-gold/20 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg font-bold">حذف الملف؟</AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-7">
              سيتم حذف الملف نهائياً من الموقع. لا يمكن التراجع.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={busy}
              className="gap-1.5 rounded-xl bg-destructive text-white hover:bg-destructive/90"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
