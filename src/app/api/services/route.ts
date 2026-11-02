import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/services — قائمة الخدمات مع عدد الملفات
export async function GET() {
  try {
    const services = await db.service.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        _count: { select: { files: true } },
      },
    });
    return NextResponse.json({
      services: services.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        icon: s.icon,
        sortOrder: s.sortOrder,
        filesCount: s._count.files,
        createdAt: s.createdAt,
      })),
    });
  } catch (e) {
    console.error("GET /api/services error:", e);
    return NextResponse.json({ error: "تعذر تحميل الخدمات" }, { status: 500 });
  }
}
