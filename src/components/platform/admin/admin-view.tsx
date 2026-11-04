"use client";

// لوحة التحكم: تسجيل دخول + إدارة كاملة للمحتوى
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CloudUpload,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  apiFetch,
  PublishResultDTO,
  useAdminSession,
  usePublishStatus,
} from "@/lib/client-api";
import { ServicesManager } from "./services-manager";
import { FilesManager } from "./files-manager";
import { GalleryManager } from "./gallery-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ================= شاشة الدخول ================= */

function LoginScreen({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("أدخل كلمة المرور");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiFetch("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      toast.success("مرحباً بك في لوحة التحكم ✓");
      qc.invalidateQueries({ queryKey: ["admin-session"] });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center px-4">
      <div className="bg-arabesque pointer-events-none absolute inset-0" aria-hidden />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card gold-glow relative w-full max-w-md rounded-[2rem] p-8"
      >
        <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-gold/30 bg-gold/10">
          <KeyRound className="h-8 w-8 text-gold" />
        </span>
        <h1 className="font-display text-center text-2xl font-bold text-gold-gradient">
          دخول المشرف
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          هذه المنطقة مخصصة لإدارة المحتوى فقط
        </p>

        <form onSubmit={submit} className="mt-7 space-y-4">
          <div className="relative">
            <Input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="كلمة المرور"
              autoFocus
              className={`h-12 rounded-2xl border-gold/20 bg-secondary/40 ps-4 pe-12 text-base focus-visible:ring-gold/40 ${
                error ? "border-destructive/60" : ""
              }`}
              aria-label="كلمة المرور"
              aria-invalid={!!error}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute end-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-gold-light"
              aria-label={show ? "إخفاء" : "إظهار"}
            >
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {error && (
            <motion.p
              initial={{ x: -6 }}
              animate={{ x: [0, -6, 6, -3, 0] }}
              className="text-center text-sm font-bold text-destructive"
            >
              {error}
            </motion.p>
          )}
          <Button
            type="submit"
            disabled={loading}
            className="btn-gold h-12 w-full rounded-2xl text-base font-bold"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "دخول"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

/* ================= اللوحة ================= */

function Dashboard({ onExit }: { onExit: () => void }) {
  const qc = useQueryClient();
  const [publishing, setPublishing] = useState(false);
  const { data: pubStatus } = usePublishStatus();
  const publishAvailable = pubStatus?.available ?? false;
  const hasChanges = pubStatus?.hasChanges ?? false;

  const logout = async () => {
    await apiFetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    toast.success("تم تسجيل الخروج");
    qc.invalidateQueries({ queryKey: ["admin-session"] });
    qc.invalidateQueries({ queryKey: ["services"] });
    qc.invalidateQueries({ queryKey: ["site-images"] });
    onExit();
  };

  const publish = async () => {
    setPublishing(true);
    try {
      const res = await apiFetch<PublishResultDTO>("/api/admin/publish", {
        method: "POST",
      });
      if (res.published) {
        toast.success(res.message, { duration: 6000 });
      } else {
        toast.info(res.message);
      }
      qc.invalidateQueries({ queryKey: ["publish-status"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "تعذر النشر");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6"
    >
      {/* تنبيه النسخة المؤقتة (على Vercel) */}
      {!publishAvailable && (
        <div
          className="mb-6 flex items-start gap-3 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-600 dark:text-amber-300"
          role="alert"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <p>
            <strong className="font-bold">تنبيه:</strong> أنت تستخدم النسخة المنشورة
            وأي إضافات هنا <strong className="font-bold">مؤقتة وستُفقد</strong>. لإضافات
            دائمة افتح نسخة المعاينة (بيئة التطوير)، ارفع الملفات من لوحة التحكم ثم اضغط زر
            «نشر التحديثات».
          </p>
        </div>
      )}

      {/* ترويسة اللوحة */}
      <div className="glass-card mb-6 flex flex-wrap items-center gap-3 rounded-3xl p-5">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/30 bg-gold/10">
          <ShieldCheck className="h-6 w-6 text-gold" />
        </span>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold text-gold-gradient sm:text-2xl">
            لوحة تحكم أم غلا
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            {publishAvailable
              ? "أضف وعدّل بحرية — ثم اضغط «نشر التحديثات» لجعل التغييرات دائمة على الموقع"
              : "أضف وعدّل الخدمات والملفات والصور — التغييرات تظهر فوراً في الموقع"}
          </p>
        </div>
        {publishAvailable && (
          <Button
            onClick={publish}
            disabled={publishing}
            className="btn-gold relative h-10 gap-2 rounded-xl px-4 font-bold"
          >
            {publishing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <CloudUpload className="h-4 w-4" aria-hidden />
            )}
            {publishing ? "جارٍ النشر…" : "نشر التحديثات"}
            {hasChanges && !publishing && (
              <span className="absolute -end-1 -top-1.5 flex h-3.5 w-3.5" aria-hidden>
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-background bg-gold" />
              </span>
            )}
          </Button>
        )}
        <Button
          onClick={logout}
          variant="outline"
          className="h-10 gap-2 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          خروج
        </Button>
      </div>

      <Tabs defaultValue="services" dir="rtl" className="w-full">
        <TabsList className="mb-6 h-12 w-full justify-start gap-1 rounded-2xl border border-border/60 bg-secondary/40 p-1.5 sm:w-auto">
          <TabsTrigger
            value="services"
            className="h-9 rounded-xl px-5 text-sm font-bold data-[state=active]:bg-gold data-[state=active]:text-primary-foreground"
          >
            الخدمات
          </TabsTrigger>
          <TabsTrigger
            value="files"
            className="h-9 rounded-xl px-5 text-sm font-bold data-[state=active]:bg-gold data-[state=active]:text-primary-foreground"
          >
            الملفات
          </TabsTrigger>
          <TabsTrigger
            value="gallery"
            className="h-9 rounded-xl px-5 text-sm font-bold data-[state=active]:bg-gold data-[state=active]:text-primary-foreground"
          >
            الصور والمظهر
          </TabsTrigger>
        </TabsList>
        <TabsContent value="services">
          <ServicesManager />
        </TabsContent>
        <TabsContent value="files">
          <FilesManager />
        </TabsContent>
        <TabsContent value="gallery">
          <GalleryManager />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

/* ================= المدخل ================= */

export function AdminView({ onExit }: { onExit: () => void }) {
  const { data: session, isLoading } = useAdminSession();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!session?.authenticated) {
    return <LoginScreen onDone={() => {}} />;
  }

  return <Dashboard onExit={onExit} />;
}
