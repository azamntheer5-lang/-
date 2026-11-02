import { PrismaClient } from '@prisma/client'
import { existsSync, copyFileSync, mkdirSync } from 'fs'
import path from 'path'
import { tmpdir } from 'os'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * يحل مسار قاعدة بيانات SQLite بمرونة:
 * - محلياً: يستخدم المسار من .env مباشرة (المسار المطلق موجود).
 * - على فيرسل (سيرفرلس): نظام الملفات للقراءة فقط → ينسخ القاعدة إلى /tmp
 *   (المجلد الوحيد القابل للكتابة) حتى تعمل القراءة والكتابة بسلاسة.
 */
function resolveDatabaseUrl(): string {
  const raw = process.env.DATABASE_URL || 'file:./db/custom.db'

  // مسار خارجي (Turso/Postgres مستقبلاً) — يمرر كما هو
  if (!raw.startsWith('file:')) return raw

  let p = raw.slice('file:'.length)

  // المسار المعطى غير موجود؟ جرّب مسارات مرشحة شائعة
  if (!existsSync(p)) {
    const candidates = [
      path.join(process.cwd(), 'db', 'custom.db'),
      path.join(process.cwd(), '..', 'db', 'custom.db'),
    ]
    p = candidates.find((c) => existsSync(c)) || candidates[0]
  }

  // على فيرسل: انسخ إلى /tmp لتفادي قيود القراءة فقط
  if (process.env.VERCEL && existsSync(p)) {
    const tmpDir = path.join(tmpdir(), 'umraham-db')
    const tmpDb = path.join(tmpDir, 'custom.db')
    if (!existsSync(tmpDb)) {
      try {
        mkdirSync(tmpDir, { recursive: true })
        copyFileSync(p, tmpDb)
      } catch {
        // تعذر النسخ → اقرأ من الأصل
        return `file:${p}`
      }
    }
    return `file:${tmpDb}`
  }

  return `file:${p}`
}

process.env.DATABASE_URL = resolveDatabaseUrl()

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV !== 'production' ? ['query'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
