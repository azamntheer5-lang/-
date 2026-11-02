import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/services/[id]/files — ملفات خدمة معينة
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const serviceId = Number(id);
    if (!Number.isInteger(serviceId)) {
      return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
    }
    const service = await db.service.findUnique({
      where: { id: serviceId },
      include: {
        files: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!service) {
      return NextResponse.json({ error: "الخدمة غير موجودة" }, { status: 404 });
    }
    return NextResponse.json({
      service: {
        id: service.id,
        title: service.title,
        description: service.description,
        icon: service.icon,
      },
      files: service.files.map((f) => ({
        id: f.id,
        title: f.title,
        description: f.description,
        fileSize: f.fileSize,
        mimeType: f.mimeType,
        downloads: f.downloads,
        createdAt: f.createdAt,
      })),
    });
  } catch (e) {
    console.error("GET /api/services/[id]/files error:", e);
    return NextResponse.json({ error: "تعذر تحميل الملفات" }, { status: 500 });
  }
}
