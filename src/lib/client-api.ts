"use client";

// أنواع واستدعاءات API من جهة العميل
import { useQuery } from "@tanstack/react-query";

export interface ServiceDTO {
  id: number;
  title: string;
  description: string;
  icon: string;
  sortOrder: number;
  filesCount: number;
  createdAt: string;
}

export interface FileDTO {
  id: number;
  title: string;
  description: string;
  fileSize: number;
  mimeType: string;
  downloads: number;
  createdAt: string;
}

export interface SiteImageDTO {
  id: number;
  title: string;
  kind: string;
  createdAt: string;
}

export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body instanceof FormData ? init?.headers : { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const data = (await res.json().catch(() => null)) as T & { error?: string };
  if (!res.ok) {
    throw new Error(data?.error || "حدث خطأ غير متوقع");
  }
  return data as T;
}

export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: () => apiFetch<{ services: ServiceDTO[] }>("/api/services"),
    select: (d) => d.services,
  });
}

export function useServiceFiles(serviceId: number | null) {
  return useQuery({
    queryKey: ["service-files", serviceId],
    queryFn: () =>
      apiFetch<{ service: { id: number; title: string; description: string; icon: string }; files: FileDTO[] }>(
        `/api/services/${serviceId}/files`
      ),
    enabled: serviceId !== null,
  });
}

export function useSiteImages() {
  return useQuery({
    queryKey: ["site-images"],
    queryFn: () => apiFetch<{ hero: SiteImageDTO | null; gallery: SiteImageDTO[] }>("/api/site/images"),
  });
}

export function useAdminSession() {
  return useQuery({
    queryKey: ["admin-session"],
    queryFn: () => apiFetch<{ authenticated: boolean }>("/api/admin/session"),
  });
}

/* ================= حالة النشر الدائم ================= */

export interface PublishStatusDTO {
  available: boolean;
  hasChanges: boolean;
}

export function usePublishStatus() {
  return useQuery({
    queryKey: ["publish-status"],
    queryFn: () => apiFetch<PublishStatusDTO>("/api/admin/publish"),
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
  });
}

export interface PublishResultDTO {
  ok: boolean;
  published: boolean;
  commit?: string;
  message: string;
}

export function imageUrl(id: number) {
  return `/api/site/images/${id}/content`;
}

export function fileContentUrl(id: number, download = false) {
  return `/api/files/${id}/content${download ? "?download=1" : ""}`;
}

export const WHATSAPP_NUMBER = "967770309310";
export const WHATSAPP_DISPLAY = "770309310";
export function whatsappLink(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
