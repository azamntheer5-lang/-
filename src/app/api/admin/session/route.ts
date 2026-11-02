import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

// GET /api/admin/session — هل الجلسة الحالية مشرف؟
export async function GET() {
  return NextResponse.json({ authenticated: await isAdmin() });
}
