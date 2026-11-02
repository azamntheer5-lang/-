"use client";

// إدارة الخدمات: إضافة، تعديل، حذف
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { ServiceDTO, apiFetch, useServices } from "@/lib/client-api";
import { ICON_KEYS, serviceIcon } from "../icon-map";

interface ServiceForm {
  title: string;
  description: string;
  icon: string;
}

/* ===== نموذج إضافة/تعديل خدمة ===== */
function ServiceDialog({
  open,
  initial,
  editingId,
  onClose,
}: {
  open: boolean;
  initial: ServiceForm | null;
  editingId: number | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<ServiceForm>(initial ?? { title: "", description: "", icon: "folder" });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.title.trim()) {
      toast.error("عنوان الخدمة مطلوب");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await apiFetch(`/api/admin/services/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
        toast.success("تم تعديل الخدمة ✓");
      } else {
        await apiFetch("/api/admin/services", {
          method: "POST",
          body: JSON.stringify(form),
        });
        toast.success("تمت إضافة الخدمة ✓");
      }
      qc.invalidateQueries({ queryKey: ["services"] });
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "تعذر الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent dir="rtl" aria-describedby={undefined} className="max-w-lg rounded-3xl border-gold/20 bg-card sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-bold text-gold-gradient">
            {editingId ? "تعديل خدمة" : "إضافة خدمة جديدة"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <label className="mb-1.5 block text-sm font-bold text-foreground" htmlFor="svc-title">
              عنوان الخدمة
            </label>
            <Input
              id="svc-title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="مثال: البحوث الطلابية"
              className="h-11 rounded-xl border-gold/20 bg-secondary/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold text-foreground" htmlFor="svc-desc">
              الوصف
            </label>
            <Textarea
              id="svc-desc"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="وصف قصير يظهر في بطاقة الخدمة"
              className="min-h-20 rounded-xl border-gold/20 bg-secondary/40"
            />
          </div>
          <div>
            <span className="mb-2 block text-sm font-bold text-foreground">أيقونة الخدمة</span>
            <div className="grid max-h-44 grid-cols-7 gap-2 overflow-y-auto rounded-2xl border border-border/60 bg-secondary/30 p-3 scrollbar-thin sm:grid-cols-10">
              {ICON_KEYS.map((key) => {
                const Icon = serviceIcon(key);
                const active = form.icon === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, icon: key }))}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
                      active
                        ? "border-gold bg-gold/20 text-gold shadow-[0_0_14px_rgba(212,165,55,0.35)]"
                        : "border-border/60 text-muted-foreground hover:border-gold/40 hover:text-gold-light"
                    }`}
                    aria-label={`أيقونة ${key}`}
                    aria-pressed={active}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border/50 pt-4">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            إلغاء
          </Button>
          <Button onClick={save} disabled={saving} className="btn-gold gap-2 rounded-xl font-bold">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {editingId ? "حفظ التعديلات" : "إضافة الخدمة"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ===== مدير الخدمات ===== */
export function ServicesManager() {
  const { data: services, isLoading } = useServices();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: number; form: ServiceForm } | null>(null);
  const [deleting, setDeleting] = useState<ServiceDTO | null>(null);
  const [busy, setBusy] = useState(false);

  const confirmDelete = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await apiFetch(`/api/admin/services/${deleting.id}`, { method: "DELETE" });
      toast.success(`تم حذف «${deleting.title}» مع كل ملفاتها`);
      qc.invalidateQueries({ queryKey: ["services"] });
      setDeleting(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "تعذر الحذف");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">إدارة الخدمات</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {services ? `${services.length} خدمة في الموقع` : "..."}
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
          className="btn-gold h-11 gap-2 rounded-2xl px-5 text-sm font-bold"
        >
          <Plus className="h-4 w-4" />
          إضافة خدمة
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services?.map((s) => {
            const Icon = serviceIcon(s.icon);
            return (
              <div key={s.id} className="glass-card rounded-3xl p-5">
                <div className="flex items-start gap-3.5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gold/25 bg-gold/10">
                    <Icon className="h-6 w-6 text-gold" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-bold text-foreground">{s.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {s.description || "بدون وصف"}
                    </p>
                    <span className="mt-2 inline-block rounded-full border border-gold/20 bg-gold/8 px-2 py-0.5 text-[11px] text-gold-light">
                      {s.filesCount} ملف
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2 border-t border-border/50 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditing({
                        id: s.id,
                        form: { title: s.title, description: s.description, icon: s.icon },
                      });
                      setDialogOpen(true);
                    }}
                    className="h-9 flex-1 gap-1.5 rounded-xl border-gold/25 text-xs font-bold text-gold-light hover:bg-gold/10 hover:text-gold-light"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    تعديل
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleting(s)}
                    className="h-9 flex-1 gap-1.5 rounded-xl border-destructive/30 text-xs font-bold text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    حذف
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* حوار الإضافة/التعديل */}
      {dialogOpen && (
        <ServiceDialog
          key={editing ? `edit-${editing.id}` : "new"}
          open={dialogOpen}
          editingId={editing?.id ?? null}
          initial={editing?.form ?? { title: "", description: "", icon: "folder" }}
          onClose={() => {
            setDialogOpen(false);
            setEditing(null);
          }}
        />
      )}

      {/* تأكيد الحذف */}
      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent dir="rtl" aria-describedby={undefined} className="rounded-3xl border-gold/20 bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg font-bold">
              حذف «{deleting?.title}»؟
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-7">
              سيتم حذف الخدمة وكل ملفاتها نهائياً ولا يمكن التراجع. هل أنت متأكد؟
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
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
