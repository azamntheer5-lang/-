import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // تضمين قاعدة البيانات وملفات الرفع مع دوال الـ API (أساسي للنشر على فيرسل)
  outputFileTracingIncludes: {
    "/api/**/*": ["./db/custom.db", "./storage/uploads/**/*"],
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
