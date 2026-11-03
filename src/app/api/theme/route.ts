import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { DEFAULT_THEME_ID, THEME_SETTING_KEY } from "@/lib/themes";

/** لون الهوية الحالي للموقع (عام للجميع) */
export async function GET() {
  try {
    const row = await db.setting.findUnique({ where: { key: THEME_SETTING_KEY } });
    return NextResponse.json({ themeId: row?.value ?? DEFAULT_THEME_ID });
  } catch {
    return NextResponse.json({ themeId: DEFAULT_THEME_ID });
  }
}
