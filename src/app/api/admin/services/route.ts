import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

// POST /api/admin/services — إنشاء خدمة جديدة
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json().catch(() => null);
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json({ error: "عنوان الخدمة مطلوب" }, { status: 400 });
    }
    const description =
      typeof body?.description === "string" ? body.description.trim() : "";
    const icon = typeof body?.icon === "string" && body.icon ? body.icon : "folder";

    const maxOrder = await db.service.aggregate({ _max: { sortOrder: true } });
    const service = await db.service.create({
      data: {
        title,
        description,
        icon,
        sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });
    return NextResponse.json({ service }, { status: 201 });
  } catch (e) {
    console.error("POST /api/admin/services error:", e);
    return NextResponse.json({ error: "تعذر إنشاء الخدمة" }, { status: 500 });
  }
}
