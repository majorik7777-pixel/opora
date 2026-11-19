import path from "node:path";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

// Единый источник env для всего pnpm-workspace — корень репозитория.
// Next по умолчанию читает apps/web/.env*, а у нас один .env на проект.
const repoRoot = path.resolve(process.cwd(), "../..");
loadEnvConfig(repoRoot, process.env.NODE_ENV !== "production");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Внутренние пакеты поставляются исходным TypeScript — Next их транспилирует.
  transpilePackages: [
    "@opora/ui",
    "@opora/shared",
    "@opora/db",
    "@opora/core",
    "@opora/llm",
  ],
  // WASM/нативные драйверы БД нельзя бандлить — грузим из node_modules.
  serverExternalPackages: ["@electric-sql/pglite", "pg", "drizzle-orm"],
  outputFileTracingRoot: repoRoot,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), geolocation=(), microphone=(self)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
