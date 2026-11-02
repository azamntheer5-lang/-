import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { removeStored } from "@/lib/storage";

// DELETE /api/admin/site/images/[id] — حذف صورة
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const imageId = Number(id);
    if (!Number.isInteger(imageId)) {
      return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
    }
    const image = await db.siteImage.findUnique({ where: { id: imageId } });
    if (!image) {
      return NextResponse.json({ error: "الصورة غير موجودة" }, { status: 404 });
    }
    await db.siteImage.delete({ where: { id: image.id } });
    removeStored(image.storedName);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/site/images/[id] error:", e);
    return NextResponse.json({ error: "تعذر حذف الصورة" }, { status: 500 });
  }
}
