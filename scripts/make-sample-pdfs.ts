// مولّد ملفات PDF تجريبية بسيطة وصحيحة البنية
import { mkdirSync, writeFileSync } from "fs";
import path from "path";

const OUT_DIR = path.join(process.cwd(), "storage", "uploads");

function escapePdf(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildPdf(lines: string[]): Buffer {
  // صفحة A4 بمحاذاة سطور إنجليزية بسيطة (الخطوط القياسية لا تدعم العربية)
  const contentLines: string[] = ["BT", "/F1 16 Tf", "50 780 Td", "18 TL"];
  for (const line of lines) {
    contentLines.push(`(${escapePdf(line)}) Tj T*`);
  }
  contentLines.push("ET");
  const content = contentLines.join("\n");

  const objects: string[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>",
    `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const off of offsets) {
    xref += `${String(off).padStart(10, "0")} 00000 n \n`;
  }
  xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf + xref, "utf8");
}

const samples: { storedName: string; lines: string[] }[] = [
  {
    storedName: "sample-research-guide.pdf",
    lines: [
      "Um Raham - Integrated Student Services",
      "==================================================",
      "",
      "Sample Document: Research Methodology Guide",
      "(Arabic: دليل منهجية البحث العلمي)",
      "",
      "This is a demo placeholder PDF uploaded with the seed data.",
      "You can delete it and upload your real files anytime",
      "from the admin dashboard (Services > Files).",
      "",
      "--------------------------------------------------",
      "1. Choosing the research topic",
      "2. Building the research plan",
      "3. Collecting sources and references",
      "4. Writing chapters (APA style)",
      "5. Review and final delivery",
      "",
      "Contact via WhatsApp: 770309310",
    ],
  },
  {
    storedName: "sample-apa.pdf",
    lines: [
      "Um Raham - Integrated Student Services",
      "==================================================",
      "",
      "Sample Document: APA Referencing Cheat Sheet",
      "(Arabic: ورقة توثيق المراجع بنظام APA)",
      "",
      "Demo placeholder file - replace it from the dashboard.",
      "",
      "In-text citation: (Author, Year)",
      "Reference list: Author, A. (Year). Title. Publisher.",
      "",
      "Contact via WhatsApp: 770309310",
    ],
  },
  {
    storedName: "sample-thesis.pdf",
    lines: [
      "Um Raham - Integrated Student Services",
      "==================================================",
      "",
      "Sample Document: Graduation Thesis Template",
      "(Arabic: قالب مشروع تخرج)",
      "",
      "Demo placeholder file - replace it from the dashboard.",
      "",
      "Chapter 1: Introduction and problem statement",
      "Chapter 2: Literature review",
      "Chapter 3: Methodology",
      "Chapter 4: Results and analysis",
      "Chapter 5: Conclusions and recommendations",
      "",
      "Contact via WhatsApp: 770309310",
    ],
  },
  {
    storedName: "sample-summary.pdf",
    lines: [
      "Um Raham - Integrated Student Services",
      "==================================================",
      "",
      "Sample Document: Course Summary Sample",
      "(Arabic: نموذج ملخص مقرر دراسي)",
      "",
      "Demo placeholder file - replace it from the dashboard.",
      "",
      "Key points, definitions, and exam-focused notes.",
      "",
      "Contact via WhatsApp: 770309310",
    ],
  },
  {
    storedName: "sample-presentation.pdf",
    lines: [
      "Um Raham - Integrated Student Services",
      "==================================================",
      "",
      "Sample Document: Presentation Outline (PDF export)",
      "(Arabic: هيكل عرض تقديمي)",
      "",
      "Demo placeholder file - replace it from the dashboard.",
      "",
      "Slide 1: Title  |  Slide 2: Agenda  |  Slide 3: Content",
      "Slide 4: Analysis  |  Slide 5: Conclusion  |  Q&A",
      "",
      "Contact via WhatsApp: 770309310",
    ],
  },
  {
    storedName: "sample-exam.pdf",
    lines: [
      "Um Raham - Integrated Student Services",
      "==================================================",
      "",
      "Sample Document: Practice Exam Model",
      "(Arabic: نموذج اختبار تجريبي)",
      "",
      "Demo placeholder file - replace it from the dashboard.",
      "",
      "Q1 ... Q2 ... Q3 ... Model answers attached.",
      "",
      "Contact via WhatsApp: 770309310",
    ],
  },
  {
    storedName: "sample-solutions.pdf",
    lines: [
      "Um Raham - Integrated Student Services",
      "==================================================",
      "",
      "Sample Document: Textbook Solutions Sample",
      "(Arabic: نموذج حلول كتاب)",
      "",
      "Demo placeholder file - replace it from the dashboard.",
      "",
      "Step-by-step solutions with explanations.",
      "",
      "Contact via WhatsApp: 770309310",
    ],
  },
  {
    storedName: "sample-translation.pdf",
    lines: [
      "Um Raham - Integrated Student Services",
      "==================================================",
      "",
      "Sample Document: Translation Style Guide",
      "(Arabic: دليل أسلوب الترجمة)",
      "",
      "Demo placeholder file - replace it from the dashboard.",
      "",
      "EN <-> AR academic translation notes.",
      "",
      "Contact via WhatsApp: 770309310",
    ],
  },
];

mkdirSync(OUT_DIR, { recursive: true });
for (const s of samples) {
  writeFileSync(path.join(OUT_DIR, s.storedName), buildPdf(s.lines));
  console.log("created:", s.storedName);
}
console.log("Done generating sample PDFs.");
