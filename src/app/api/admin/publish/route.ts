import { NextResponse } from "next/server";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import { requireAdmin } from "@/lib/admin-guard";

// نشر التغييرات من لوحة التحكم إلى GitHub (يشغّل نشر Vercel تلقائياً)
// يعمل فقط في بيئة المعاينة المحلية حيث يوجد مستودع git

const exec = promisify(execFile);
const PROJECT_ROOT = process.cwd();
const GIT_TIMEOUT = 180_000; // 3 دقائق للملفات الكبيرة

function repoAvailable(): boolean {
  try {
    return fs.statSync(path.join(PROJECT_ROOT, ".git")).isDirectory();
  } catch {
    return false;
  }
}

async function git(...args: string[]): Promise<string> {
  const { stdout } = await exec("git", args, {
    cwd: PROJECT_ROOT,
    timeout: GIT_TIMEOUT,
    maxBuffer: 10 * 1024 * 1024,
  });
  return (stdout || "").trim();
}

async function hasUnpushedCommits(): Promise<boolean> {
  try {
    const count = await git("rev-list", "--count", "origin/main..main");
    return Number(count) > 0;
  } catch {
    return false;
  }
}

// GET /api/admin/publish — هل النشر متاح؟ وهل توجد تغييرات غير منشورة؟
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!repoAvailable()) {
    // على Vercel لا يوجد مستودع git — النشر غير متاح
    return NextResponse.json({ available: false, hasChanges: false });
  }
  try {
    const status = await git("status", "--porcelain");
    const unpushed = await hasUnpushedCommits();
    return NextResponse.json({
      available: true,
      hasChanges: status.length > 0 || unpushed,
    });
  } catch {
    return NextResponse.json({ available: false, hasChanges: false });
  }
}

// POST /api/admin/publish — commit + push لكل التغييرات
export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;

  if (!repoAvailable()) {
    return NextResponse.json(
      {
        error:
          "النشر الدائم غير متاح في هذه النسخة. افتح نسخة المعاينة (بيئة التطوير) واعد الإضافة من هناك ثم اضغط زر النشر.",
      },
      { status: 400 }
    );
  }

  try {
    const status = await git("status", "--porcelain");

    if (status) {
      await git("add", "-A");
      const stamp = new Date().toISOString().replace("T", " ").slice(0, 16);
      await git("commit", "-m", `🔄 تحديث المحتوى من لوحة التحكم — ${stamp}`);
    }

    let pushed = false;
    if (await hasUnpushedCommits()) {
      await git("push", "origin", "main");
      pushed = true;
    }

    if (!status && !pushed) {
      return NextResponse.json({
        ok: true,
        published: false,
        message: "لا توجد تغييرات جديدة للنشر — كل شيء منشور مسبقاً ✓",
      });
    }

    const hash = await git("rev-parse", "--short", "HEAD");
    return NextResponse.json({
      ok: true,
      published: true,
      commit: hash,
      message: `تم النشر بنجاح ✓ (${hash}) — سيصل التحديث إلى الموقع خلال دقائق`,
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : "خطأ غير معروف";
    return NextResponse.json(
      { error: `تعذر إتمام النشر: ${detail.slice(0, 300)}` },
      { status: 500 }
    );
  }
}
