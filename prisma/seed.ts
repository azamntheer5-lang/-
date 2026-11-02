// بيانات أولية: الخدمات + ملفات تجريبية + صورة البطل
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import { copyFile, stat } from "fs/promises";
import path from "path";

const db = new PrismaClient();
const UPLOADS = path.join(process.cwd(), "storage", "uploads");
const HERO_SRC = path.join(process.cwd(), "upload", "IMG-20261102-WA0000.jpg");

async function seed() {
  const existing = await db.service.count();
  if (existing > 0) {
    console.log("Seed skipped: services already exist.");
    return;
  }

  // 1) صورة البطل: ضغط الصورة المرفوعة وتحويلها webp
  const heroStored = "hero-raham.webp";
  try {
    await sharp(HERO_SRC)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 86 })
      .toFile(path.join(UPLOADS, heroStored));
    console.log("Hero image optimized:", heroStored);
  } catch (e) {
    // في حال فشل الضغط نستخدم الصورة الأصلية
    await copyFile(HERO_SRC, path.join(UPLOADS, heroStored));
    console.log("Hero image copied as-is:", heroStored);
  }

  const fileSize = async (name: string) => {
    try {
      return (await stat(path.join(UPLOADS, name))).size;
    } catch {
      return 0;
    }
  };

  // 2) الخدمات
  const servicesData = [
    {
      title: "البحوث الطلابية",
      description: "بحوث علمية متكاملة وفق المنهجية الأكاديمية وتوثيق المراجع",
      icon: "search",
      sortOrder: 1,
      files: [
        { stored: "sample-research-guide.pdf", title: "دليل منهجية البحث العلمي", desc: "خطوات إعداد البحث من اختيار الموضوع حتى التسليم" },
        { stored: "sample-apa.pdf", title: "توثيق المراجع بنظام APA", desc: "الطريقة الصحيحة للاقتباس والتوثيق داخل المتن والقائمة" },
        { stored: "sample-thesis.pdf", title: "قالب مشروع تخرج جاهز", desc: "هيكل الفصول الخمسة مع التنسيق الأكاديمي" },
      ],
    },
    {
      title: "الملخصات الدراسية",
      description: "ملخصات مركزة للمقررات تساعدك على المراجعة قبل الاختبار",
      icon: "note",
      sortOrder: 2,
      files: [
        { stored: "sample-summary.pdf", title: "نموذج ملخص مقرر دراسي", desc: "نقاط رئيسية وتعريفات مركزة" },
      ],
    },
    {
      title: "العروض التقديمية",
      description: "عروض بوربوينت احترافية بتصاميم أنيقة ومحتوى منظم",
      icon: "presentation",
      sortOrder: 3,
      files: [
        { stored: "sample-presentation.pdf", title: "هيكل عرض تقديمي نموذجي", desc: "من المقدمة إلى الخاتمة بشكل منسق" },
      ],
    },
    {
      title: "حلول الكتب والتمارين",
      description: "حلول تفصيلية خطوة بخطوة مع شرح مبسط",
      icon: "book",
      sortOrder: 4,
      files: [
        { stored: "sample-solutions.pdf", title: "نموذج حلول كتاب", desc: "حلول مرتبة مع الشرح" },
      ],
    },
    {
      title: "الاختبارات والنماذج",
      description: "اختبارات سابقة ونماذج تجريبية مع الإجابات النموذجية",
      icon: "clipboard",
      sortOrder: 5,
      files: [
        { stored: "sample-exam.pdf", title: "نموذج اختبار تجريبي", desc: "أسئلة مع إجاباتها النموذجية" },
      ],
    },
    {
      title: "مشاريع التخرج",
      description: "متابعة كاملة لمشروع التخرج من الخطة حتى المناقشة",
      icon: "graduation",
      sortOrder: 6,
      files: [
        { stored: "sample-thesis.pdf", title: "دليل إعداد خطة مشروع التخرج", desc: "كل ما تحتاجه لكتابة الخطة واعتمادها" },
      ],
    },
    {
      title: "الترجمة والمراجعة",
      description: "ترجمة أكاديمية دقيقة ومراجعة لغوية لتدقيق أعمالك",
      icon: "languages",
      sortOrder: 7,
      files: [
        { stored: "sample-translation.pdf", title: "دليل أسلوب الترجمة الأكاديمية", desc: "أهم قواعد الترجمة بين العربية والإنجليزية" },
      ],
    },
  ];

  for (const s of servicesData) {
    const service = await db.service.create({
      data: {
        title: s.title,
        description: s.description,
        icon: s.icon,
        sortOrder: s.sortOrder,
      },
    });
    for (const f of s.files) {
      const size = await fileSize(f.stored);
      if (!size) {
        console.warn("Missing sample file:", f.stored);
        continue;
      }
      await db.fileItem.create({
        data: {
          title: f.title,
          description: f.desc,
          storedName: f.stored,
          originalName: f.stored,
          fileSize: size,
          mimeType: "application/pdf",
          serviceId: service.id,
        },
      });
    }
    console.log("Service seeded:", s.title);
  }

  // 3) صورة البطل في قاعدة البيانات
  await db.siteImage.create({
    data: {
      title: "أم رهام",
      kind: "hero",
      storedName: heroStored,
    },
  });

  console.log("Seed completed successfully.");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
