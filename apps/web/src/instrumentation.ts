/**
 * Инструментация сервера Next.js (вызывается один раз при старте процесса).
 * При AUTO_MIGRATE=true применяем миграции — это удобно для dev/e2e.
 * В production миграции прогоняются отдельным шагом деплоя (runbook),
 * поэтому AUTO_MIGRATE по умолчанию выключен в NODE_ENV=production.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { getEnv } = await import("@opora/shared/server");
  const env = getEnv();

  if (!env.autoMigrate) return;

  const { ensureDatabaseReady } = await import("@opora/db");
  await ensureDatabaseReady();
  console.info("[opora] база данных готова (миграции применены)");
}
