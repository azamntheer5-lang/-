import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/files/[id] — بيانات ملف واحد (مع اسم الخدمة)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const fileId = Number(id);
    if (!Number.isInteger(fileId)) {
      return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
    }
    const file = await db.fileItem.findUnique({
      where: { id: fileId },
      include: { service: { select: { title: true, icon: true } } },
    });
    if (!file) {
      return NextResponse.json({ error: "الملف غير موجود" }, { status: 404 });
    }
    return NextResponse.json({
      file: {
        id: file.id,
        title: file.title,
        description: file.description,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        downloads: file.downloads,
        createdAt: file.createdAt,
        serviceTitle: file.service.title,
      },
    });
  } catch (e) {
    console.error("GET /api/files/[id] error:", e);
    return NextResponse.json({ error: "تعذر جلب بيانات الملف" }, { status: 500 });
  }
}
