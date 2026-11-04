import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { THEME_SETTING_KEY, THEMES } from "@/lib/themes";

/** حفظ لون الهوية الجديد للموقع (مشرف فقط) */
export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = (await request.json().catch(() => null)) as { themeId?: string } | null;
    const themeId = body?.themeId;
    if (!themeId || !THEMES.some((t) => t.id === themeId)) {
      return NextResponse.json({ error: "لون غير معروف" }, { status: 400 });
    }

    await db.setting.upsert({
      where: { key: THEME_SETTING_KEY },
      update: { value: themeId },
      create: { key: THEME_SETTING_KEY, value: themeId },
    });

    return NextResponse.json({ ok: true, themeId });
  } catch {
    return NextResponse.json({ error: "تعذر حفظ اللون" }, { status: 500 });
  }
}
