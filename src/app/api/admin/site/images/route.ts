import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { ensureStorage, removeStored, storedNameFor, storedPath } from "@/lib/storage";

const MAX_IMAGE_SIZE = 30 * 1024 * 1024; // 30MB

// POST /api/admin/site/images — رفع صورة (hero أو gallery) مع ضغطها تلقائياً
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const formData = await req.formData();
    const upload = formData.get("image");
    if (!(upload instanceof File)) {
      return NextResponse.json({ error: "لم يتم اختيار صورة" }, { status: 400 });
    }
    if (upload.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "حجم الصورة يتجاوز 30MB" }, { status: 413 });
    }
    const kind = formData.get("kind") === "hero" ? "hero" : "gallery";
    const title = typeof formData.get("title") === "string" ? String(formData.get("title")).trim() : "";
    const serviceIdRaw = formData.get("serviceId");
    let serviceId: number | null = null;
    if (typeof serviceIdRaw === "string" && serviceIdRaw) {
      const parsed = Number(serviceIdRaw);
      if (Number.isInteger(parsed)) serviceId = parsed;
    }

    ensureStorage();
    // ضغط الصورة إلى webp بعرض أقصى 1600px للأداء
    const buffer = Buffer.from(await upload.arrayBuffer());
    const optimized = await sharp(buffer)
      .rotate() // احترام بيانات EXIF للدوران
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const storedName = storedNameFor("x.webp");
    const { writeFile } = await import("fs/promises");
    await writeFile(storedPath(storedName), optimized);

    // صورة البطل واحدة فقط: نحذف القديمة
    if (kind === "hero") {
      const oldHeroes = await db.siteImage.findMany({ where: { kind: "hero" } });
      for (const old of oldHeroes) {
        await db.siteImage.delete({ where: { id: old.id } });
        removeStored(old.storedName);
      }
    }

    const image = await db.siteImage.create({
      data: {
        title: title || (kind === "hero" ? "صورة الغلاف" : ""),
        kind,
        storedName,
        serviceId,
      },
    });
    return NextResponse.json({ ok: true, image: { id: image.id, kind: image.kind } }, { status: 201 });
  } catch (e) {
    console.error("POST /api/admin/site/images error:", e);
    return NextResponse.json({ error: "تعذر رفع الصورة" }, { status: 500 });
  }
}
