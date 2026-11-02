import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

/** حرس المصادقة: يعيد استجابة 401 أو null إذا كان مشرفاً */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (await isAdmin()) return null;
  return NextResponse.json({ error: "غير مصرح — سجّل الدخول كمشرف" }, { status: 401 });
}
