import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit используется для генерации SQL-миграций при развитии схемы.
 * Runtime-миграции живут в src/migrations.ts (см. ADR-0002).
 */
export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://localhost:5432/opora",
  },
  strict: false,
  verbose: true,
});
