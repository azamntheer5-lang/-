import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, COOKIE_OPTIONS, checkPassword, createAdminToken } from "@/lib/auth";

// POST /api/admin/login — تسجيل دخول المشرف
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const password = typeof body?.password === "string" ? body.password : "";
    if (!password || !checkPassword(password)) {
      return NextResponse.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, createAdminToken(), COOKIE_OPTIONS);
    return res;
  } catch (e) {
    console.error("POST /api/admin/login error:", e);
    return NextResponse.json({ error: "تعذر تسجيل الدخول" }, { status: 500 });
  }
}
