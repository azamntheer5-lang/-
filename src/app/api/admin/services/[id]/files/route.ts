import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import {
  ensureStorage,
  mimeFromName,
  storedNameFor,
  storedPath,
  titleFromName,
} from "@/lib/storage";

const MAX_FILE_SIZE = 300 * 1024 * 1024; // 300MB لكل ملف

// POST /api/admin/services/[id]/files — رفع ملفات إلى خدمة (متعدد)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const serviceId = Number(id);
    if (!Number.isInteger(serviceId)) {
      return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
    }
    const service = await db.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return NextResponse.json({ error: "الخدمة غير موجودة" }, { status: 404 });
    }

    const formData = await req.formData();
    const uploads = formData.getAll("files").filter((v): v is File => v instanceof File);
    if (uploads.length === 0) {
      return NextResponse.json({ error: "لم يتم اختيار أي ملف" }, { status: 400 });
    }

    ensureStorage();
    const created: { id: number; title: string }[] = [];
    for (const upload of uploads) {
      if (upload.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `حجم الملف "${upload.name}" يتجاوز 300MB` },
          { status: 413 }
        );
      }
      const storedName = storedNameFor(upload.name);
      const buffer = Buffer.from(await upload.arrayBuffer());
      await writeFile(storedPath(storedName), buffer);
      const file = await db.fileItem.create({
        data: {
          title: titleFromName(upload.name),
          storedName,
          originalName: upload.name,
          fileSize: upload.size,
          mimeType: upload.type || mimeFromName(upload.name),
          serviceId: service.id,
        },
      });
      created.push({ id: file.id, title: file.title });
    }
    return NextResponse.json({ ok: true, count: created.length, files: created }, { status: 201 });
  } catch (e) {
    console.error("POST /api/admin/services/[id]/files error:", e);
    return NextResponse.json({ error: "تعذر رفع الملفات" }, { status: 500 });
  }
}
