// أدوات تنسيق للعرض

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "—";
  const units = ["بايت", "ك.ب", "م.ب", "ج.ب"];
  let i = 0;
  let val = bytes;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  const num = i === 0 ? val : val.toFixed(1).replace(/\.0$/, "");
  return `${num} ${units[i]}`;
}

export function formatDate(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("ar", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}
