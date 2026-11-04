"use client";

// إدارة الصور: صورة الغلاف (hero) وصور معرض الأعمال
import { ImagePlus, Loader2, Star, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch, imageUrl, SiteImageDTO, useSiteImages } from "@/lib/client-api";
import { formatDate } from "@/lib/format";

function uploadImage(file: File, kind: "hero" | "gallery", title: string, onProgress: (p: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const fd = new FormData();
    fd.append("image", file);
    fd.append("kind", kind);
    if (title) fd.append("title", title);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/site/images");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(res.error || "فشل الرفع"));
      } catch {
        reject(new Error("فشل الرفع"));
      }
    };
    xhr.onerror = () => reject(new Error("انقطع الاتصال"));
    xhr.send(fd);
  });
}

export function GalleryManager() {
  const { data, isLoading } = useSiteImages();
  const qc = useQueryClient();
  const hero = data?.hero ?? null;
  const gallery = data?.gallery ?? [];

  const [heroBusy, setHeroBusy] = useState(false);
  const [heroProgress, setHeroProgress] = useState(0);
  const heroInput = useRef<HTMLInputElement>(null);

  const [galleryBusy, setGalleryBusy] = useState(false);
  const [galleryProgress, setGalleryProgress] = useState(0);
  const [newTitle, setNewTitle] = useState("");
  const galleryInput = useRef<HTMLInputElement>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["site-images"] });
  };

  const handleHeroUpload = async (file?: File | null) => {
    if (!file) return;
    setHeroBusy(true);
    setHeroProgress(0);
    try {
      await uploadImage(file, "hero", "صورة الغلاف", setHeroProgress);
      toast.success("تم تحديث صورة الغلاف ✓");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الرفع");
    } finally {
      setHeroBusy(false);
      if (heroInput.current) heroInput.current.value = "";
    }
  };

  const handleGalleryUpload = async (file?: File | null) => {
    if (!file) return;
    setGalleryBusy(true);
    setGalleryProgress(0);
    try {
      await uploadImage(file, "gallery", newTitle, setGalleryProgress);
      toast.success("تمت إضافة الصورة للمعرض ✓");
      setNewTitle("");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "فشل الرفع");
    } finally {
      setGalleryBusy(false);
      if (galleryInput.current) galleryInput.current.value = "";
    }
  };

  const confirmDelete = async () => {
    if (deletingId === null) return;
    setDeleteBusy(true);
    try {
      await apiFetch(`/api/admin/site/images/${deletingId}`, { method: "DELETE" });
      toast.success("تم حذف الصورة");
      setDeletingId(null);
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "تعذر الحذف");
    } finally {
      setDeleteBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* صورة الغلاف */}
      <section className="glass-card rounded-3xl p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display flex items-center gap-2 text-lg font-bold text-foreground">
              <Star className="h-5 w-5 text-gold" />
              صورة الغلاف الرئيسية
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              تظهر بجانب اسم المنصة في أعلى الصفحة — رفع صورة جديدة يستبدل الحالية
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="arch-frame w-40 shrink-0 overflow-hidden border-2 border-gold/40 bg-surface p-1.5">
            {hero ? (
              <img
                src={imageUrl(hero.id)}
                alt="صورة الغلاف الحالية"
                className="arch-frame h-56 w-full object-cover"
              />
            ) : (
              <div className="arch-frame flex h-56 w-full items-center justify-center bg-secondary">
                <ImagePlus className="h-8 w-8 text-gold/40" />
              </div>
            )}
          </div>
          <div className="flex-1 text-center sm:text-start">
            <input
              ref={heroInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleHeroUpload(e.target.files?.[0])}
              aria-hidden
            />
            {heroBusy ? (
              <div className="flex flex-col items-center gap-3 sm:items-start">
                <Loader2 className="h-8 w-8 animate-spin text-gold" />
                <p className="text-sm font-bold text-gold-light">جارٍ الرفع... {heroProgress}%</p>
                <div className="h-2 w-full max-w-64 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-gold-light to-gold transition-all"
                    style={{ width: `${heroProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <>
                <p className="mb-3 text-sm text-muted-foreground">
                  {hero
                    ? `الصورة الحالية منذ ${formatDate(hero.createdAt)}`
                    : "لا توجد صورة غلاف بعد"}
                </p>
                <Button
                  onClick={() => heroInput.current?.click()}
                  className="btn-gold h-11 gap-2 rounded-2xl px-6 text-sm font-bold"
                >
                  <Upload className="h-4 w-4" />
                  {hero ? "استبدال الصورة" : "رفع صورة غلاف"}
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* معرض الأعمال */}
      <section className="glass-card rounded-3xl p-6">
        <div className="mb-4">
          <h2 className="font-display flex items-center gap-2 text-lg font-bold text-foreground">
            <ImagePlus className="h-5 w-5 text-gold" />
            معرض الأعمال
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            الصور تظهر في قسم «معرض الأعمال» بالصفحة الرئيسية — يتم ضغطها تلقائياً لسرعة عرض أعلى
          </p>
        </div>

        {/* رفع صورة جديدة */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gold/20 bg-secondary/30 p-4 sm:flex-row sm:items-center">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="عنوان الصورة (اختياري) — مثال: بحث تخرج ممتاز"
            className="h-11 flex-1 rounded-xl border-gold/20 bg-background/40"
            aria-label="عنوان الصورة"
          />
          <input
            ref={galleryInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleGalleryUpload(e.target.files?.[0])}
            aria-hidden
          />
          <Button
            onClick={() => galleryInput.current?.click()}
            disabled={galleryBusy}
            className="btn-gold h-11 gap-2 rounded-xl px-6 text-sm font-bold"
          >
            {galleryBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {galleryProgress}%
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                إضافة صورة
              </>
            )}
          </Button>
        </div>

        {gallery.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gold/25 p-10 text-center text-sm text-muted-foreground">
            لا توجد صور في المعرض بعد — أضف أول صورة من الأعلى
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {gallery.map((img: SiteImageDTO) => (
              <div key={img.id} className="group relative overflow-hidden rounded-2xl border border-border/60">
                <img
                  src={imageUrl(img.id)}
                  alt={img.title || "صورة معرض"}
                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <button
                  onClick={() => setDeletingId(img.id)}
                  className="absolute top-2 end-2 rounded-xl bg-black/70 p-2 text-destructive opacity-0 transition-opacity hover:bg-destructive/90 hover:text-white group-hover:opacity-100"
                  aria-label="حذف الصورة"
                  title="حذف الصورة"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                {img.title && (
                  <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/85 to-transparent px-2 pb-2 pt-6 text-[11px] font-bold text-foreground">
                    {img.title}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* تأكيد حذف صورة */}
      {deletingId !== null && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setDeletingId(null)}
        >
          <div
            className="glass-card w-full max-w-sm rounded-3xl p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className="mx-auto mb-3 h-10 w-10 text-destructive" />
            <h3 className="font-display text-lg font-bold">حذف الصورة؟</h3>
            <p className="mt-2 text-sm text-muted-foreground">لا يمكن التراجع عن الحذف.</p>
            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setDeletingId(null)}
                className="rounded-xl"
              >
                إلغاء
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={deleteBusy}
                className="gap-1.5 rounded-xl bg-destructive text-white hover:bg-destructive/90"
              >
                {deleteBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                حذف
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
