import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { removeStored } from "@/lib/storage";

async function getService(id: string) {
  const serviceId = Number(id);
  if (!Number.isInteger(serviceId)) return null;
  return db.service.findUnique({
    where: { id: serviceId },
    include: { files: true, images: true },
  });
}

// PATCH /api/admin/services/[id] — تعديل خدمة
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const service = await getService(id);
    if (!service) {
      return NextResponse.json({ error: "الخدمة غير موجودة" }, { status: 404 });
    }
    const body = await req.json().catch(() => null);
    const data: { title?: string; description?: string; icon?: string; sortOrder?: number } = {};
    if (typeof body?.title === "string" && body.title.trim()) data.title = body.title.trim();
    if (typeof body?.description === "string") data.description = body.description.trim();
    if (typeof body?.icon === "string" && body.icon) data.icon = body.icon;
    if (Number.isFinite(body?.sortOrder)) data.sortOrder = Number(body.sortOrder);
    const updated = await db.service.update({ where: { id: service.id }, data });
    return NextResponse.json({ service: updated });
  } catch (e) {
    console.error("PATCH /api/admin/services/[id] error:", e);
    return NextResponse.json({ error: "تعذر تعديل الخدمة" }, { status: 500 });
  }
}

// DELETE /api/admin/services/[id] — حذف خدمة وملفاتها وصورها
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const service = await getService(id);
    if (!service) {
      return NextResponse.json({ error: "الخدمة غير موجودة" }, { status: 404 });
    }
    for (const f of service.files) removeStored(f.storedName);
    for (const img of service.images) removeStored(img.storedName);
    await db.service.delete({ where: { id: service.id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/services/[id] error:", e);
    return NextResponse.json({ error: "تعذر حذف الخدمة" }, { status: 500 });
  }
}
