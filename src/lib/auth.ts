// مصادقة المشرف: توكن HMAC في كوكي httpOnly
import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "or_admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Raham@2026";
const SECRET = process.env.ADMIN_SECRET || "um-raham-fallback-secret";
const TTL_MS = 1000 * 60 * 60 * 24 * 14; // أسبوعان

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function checkPassword(password: string): boolean {
  const a = Buffer.from(password);
  const b = Buffer.from(ADMIN_PASSWORD);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function createAdminToken(): string {
  const payload = `admin.${Date.now() + TTL_MS}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token?: string | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [prefix, exp, sig] = parts;
  if (prefix !== "admin" || !exp || !sig) return false;
  const expNum = Number(exp);
  if (!Number.isFinite(expNum) || expNum < Date.now()) return false;
  const expected = sign(`${prefix}.${exp}`);
  if (expected.length !== sig.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

/** هل الزائر الحالي مشرف؟ */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifyAdminToken(store.get(ADMIN_COOKIE)?.value);
}

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: TTL_MS / 1000,
};
