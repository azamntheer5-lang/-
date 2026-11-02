import { NextRequest, NextResponse } from "next/server";
import { createReadStream, existsSync, statSync } from "fs";
import { Readable } from "stream";
import { db } from "@/lib/db";
import { storedPath } from "@/lib/storage";

// GET /api/files/[id]/content?download=1 — بث الملف (معاينة أو تنزيل)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const filePath = storedPath(file.storedName);
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "محتوى الملف مفقود" }, { status: 404 });
    }

    const url = new URL(req.url);
    const isDownload = url.searchParams.get("download") === "1";
    if (isDownload) {
      // عدّاد التنزيلات (بدون تعطيل الاستجابة)
      db.fileItem
        .update({ where: { id: fileId }, data: { downloads: { increment: 1 } } })
        .catch(() => {});
    }

    const size = statSync(filePath).size;
    const disposition = isDownload ? "attachment" : "inline";
    const stream = Readable.toWeb(
      createReadStream(filePath
      )) as unknown as ReadableStream;

    return new NextResponse(stream, {
      headers: {
        "Content-Type": file.mimeType || "application/pdf",
        "Content-Length": String(size),
        "Content-Disposition": `${disposition}; filename*=UTF-8''${encodeURIComponent(
          file.originalName || file.title
        )}`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    console.error("GET /api/files/[id]/content error:", e);
    return NextResponse.json({ error: "تعذر جلب الملف" }, { status: 500 });
  }
}
