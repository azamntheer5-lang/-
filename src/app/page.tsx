"use client";

// منصة أم غلا — صفحة واحدة متكاملة: الرئيسية / الخدمات / الملفات / اللوحة
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { useAdminSession } from "@/lib/client-api";
import { TopBar } from "@/components/platform/top-bar";
import { HomeView } from "@/components/platform/home-view";
import { ServiceView } from "@/components/platform/service-view";
import { FileViewer } from "@/components/platform/file-viewer";
import { AdminView } from "@/components/platform/admin/admin-view";
import { SiteFooter } from "@/components/platform/site-footer";
import { ExitFloat, WhatsAppFloat } from "@/components/platform/floating-buttons";

type Page = "home" | "service" | "admin";

export default function UmGhalaPlatform() {
  const [page, setPage] = useState<Page>("home");
  const [activeService, setActiveService] = useState<number | null>(null);
  const [openFileId, setOpenFileId] = useState<number | null>(null);

  const { data: session } = useAdminSession();
  const isAdmin = !!session?.authenticated;

  // العودة للأعلى عند تبديل الشاشات
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page, activeService]);

  const goHome = useCallback(() => {
    setPage("home");
    setActiveService(null);
  }, []);

  const openService = useCallback((id: number) => {
    setActiveService(id);
    setPage("service");
  }, []);

  const exitAction =
    openFileId !== null
      ? () => setOpenFileId(null) // داخل العارض: أغلق الملف
      : page === "service"
        ? goHome // في مدير الملفات: عد للرئيسية
        : () => setPage("home"); // في اللوحة: عد للرئيسية

  const exitLabel = openFileId !== null ? "إغلاق" : "خروج";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar onHome={goHome} onAdmin={() => setPage("admin")} isAdmin={isAdmin} />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {page === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35 }}
            >
              <HomeView onOpenService={openService} />
            </motion.div>
          )}

          {page === "service" && activeService !== null && (
            <motion.div
              key={`service-${activeService}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35 }}
            >
              <ServiceView
                serviceId={activeService}
                onOpenFile={(id) => setOpenFileId(id)}
                onExit={goHome}
                isAdmin={isAdmin}
              />
            </motion.div>
          )}

          {page === "admin" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35 }}
            >
              <AdminView onExit={goHome} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <SiteFooter onAdmin={() => setPage("admin")} onOpenService={openService} />

      {/* زر واتساب العائم */}
      <WhatsAppFloat visible={openFileId === null} />

      {/* زر الخروج العائم — خارج الرئيسية فقط (لا يظهر فوق عارض الملفات) */}
      <AnimatePresence>
        {page !== "home" && openFileId === null && (
          <ExitFloat visible onExit={exitAction} label={exitLabel} />
        )}
      </AnimatePresence>

      {/* عارض الملفات */}
      <AnimatePresence>
        {openFileId !== null && (
          <FileViewer
            fileId={openFileId}
            onClose={() => setOpenFileId(null)}
            onNavigate={(id) => setOpenFileId(id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
