import { NextRequest, NextResponse } from "next/server";
import { createReadStream, existsSync, statSync } from "fs";
import { Readable } from "stream";
import { db } from "@/lib/db";
import { storedPath } from "@/lib/storage";

// GET /api/site/images/[id]/content — بث صورة
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const filePath = storedPath(image.storedName);
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "محتوى الصورة مفقود" }, { status: 404 });
    }
    const ext = image.storedName.split(".").pop()?.toLowerCase() || "jpg";
    const mime =
      ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : ext === "gif"
            ? "image/gif"
            : ext === "avif"
              ? "image/avif"
              : "image/jpeg";
    const size = statSync(filePath).size;
    const stream = Readable.toWeb(
      createReadStream(filePath)
    ) as unknown as ReadableStream;
    return new NextResponse(stream, {
      headers: {
        "Content-Type": mime,
        "Content-Length": String(size),
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e) {
    console.error("GET /api/site/images/[id]/content error:", e);
    return NextResponse.json({ error: "تعذر جلب الصورة" }, { status: 500 });
  }
}
