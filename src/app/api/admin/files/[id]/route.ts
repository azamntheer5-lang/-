import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { removeStored } from "@/lib/storage";

// PATCH /api/admin/files/[id] — تعديل عنوان/وصف ملف
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const fileId = Number(id);
    if (!Number.isInteger(fileId)) {
      return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
    }
    const file = await db.fileItem.findUnique({ where: { id: fileId } });
    if (!file) {
      return NextResponse.json({ error: "الملف غير موجود" }, { status: 404 });
    }
    const body = await req.json().catch(() => null);
    const data: { title?: string; description?: string } = {};
    if (typeof body?.title === "string" && body.title.trim()) data.title = body.title.trim();
    if (typeof body?.description === "string") data.description = body.description.trim();
    const updated = await db.fileItem.update({ where: { id: file.id }, data });
    return NextResponse.json({ file: updated });
  } catch (e) {
    console.error("PATCH /api/admin/files/[id] error:", e);
    return NextResponse.json({ error: "تعذر تعديل الملف" }, { status: 500 });
  }
}

// DELETE /api/admin/files/[id] — حذف ملف
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const fileId = Number(id);
    if (!Number.isInteger(fileId)) {
      return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
    }
    const file = await db.fileItem.findUnique({ where: { id: fileId } });
    if (!file) {
      return NextResponse.json({ error: "الملف غير موجود" }, { status: 404 });
    }
    await db.fileItem.delete({ where: { id: file.id } });
    removeStored(file.storedName);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/files/[id] error:", e);
    return NextResponse.json({ error: "تعذر حذف الملف" }, { status: 500 });
  }
}
