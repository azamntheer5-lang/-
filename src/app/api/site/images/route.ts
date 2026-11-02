import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/site/images — صورة البطل + صور المعرض
export async function GET() {
  try {
    const [hero, gallery] = await Promise.all([
      db.siteImage.findFirst({
        where: { kind: "hero" },
        orderBy: { createdAt: "desc" },
      }),
      db.siteImage.findMany({
        where: { kind: "gallery" },
        orderBy: { createdAt: "desc" },
      }),
    ]);
    const map = (img: typeof hero) =>
      img
        ? {
            id: img.id,
            title: img.title,
            kind: img.kind,
            createdAt: img.createdAt,
          }
        : null;
    return NextResponse.json({
      hero: map(hero),
      gallery: gallery.map(map),
    });
  } catch (e) {
    console.error("GET /api/site/images error:", e);
    return NextResponse.json({ error: "تعذر تحميل الصور" }, { status: 500 });
  }
}
