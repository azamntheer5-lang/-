// أدوات التخزين على القرص
import path from "path";
import { randomUUID } from "crypto";
import { mkdirSync, existsSync, unlinkSync } from "fs";

export const STORAGE_DIR = path.join(process.cwd(), "storage", "uploads");

export function ensureStorage() {
  if (!existsSync(STORAGE_DIR)) {
    mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

const EXT_MIME: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".txt": "text/plain",
  ".zip": "application/zip",
};

export const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];

export function getExtension(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx >= 0 ? name.slice(idx).toLowerCase() : "";
}

export function mimeFromName(name: string, fallback = "application/pdf"): string {
  return EXT_MIME[getExtension(name)] ?? fallback;
}

export function isImageName(name: string): boolean {
  return IMAGE_EXTENSIONS.includes(getExtension(name));
}

/** يحفظ الملف باسم عشوائي آمن ويعيد الاسم المخزّن */
export function storedNameFor(originalName: string): string {
  const ext = getExtension(originalName) || ".bin";
  return `${randomUUID()}${ext}`;
}

export function storedPath(storedName: string): string {
  // حماية من اجتياز المسارات
  const safe = path.basename(storedName);
  return path.join(STORAGE_DIR, safe);
}

export function removeStored(storedName: string) {
  try {
    const p = storedPath(storedName);
    if (existsSync(p)) unlinkSync(p);
  } catch {
    // نتجاهل أخطاء الحذف
  }
}

/** عنوان مقروء من اسم ملف: يحذف الامتداد وينظف الشرطات */
export function titleFromName(originalName: string): string {
  const base = originalName.replace(/\.[^.]+$/, "");
  const cleaned = base
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || originalName;
}
