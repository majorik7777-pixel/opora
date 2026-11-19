/**
 * Применение миграций вручную (production/deploy).
 * Для PGlite в dev миграции применяются автоматически при старте приложения.
 */
import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { closeDb, getDbHandle } from "../client";
import { runMigrations } from "../migrations";
import { getEnv } from "@opora/shared/server";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../../..");

config({ path: path.join(repoRoot, ".env") });

async function main(): Promise<void> {
  const env = getEnv();
  const handle = await getDbHandle();
  console.info(
    `[db:migrate] драйвер: ${handle.driver}; приложение миграций начато`,
  );
  await runMigrations(handle.db);

  if (handle.driver === "pglite") {
    console.info(
      "[db:migrate] PGlite: готово. В dev/e2e миграции и так применяются автоматически при старте сервера; " +
        "для production задай DATABASE_DRIVER=postgres и DATABASE_URL.",
    );
  } else {
    console.info(`[db:migrate] PostgreSQL: миграции применены (APP_URL=${env.APP_URL})`);
  }

  await closeDb();
}

main().catch((error: unknown) => {
  console.error("[db:migrate] ошибка:", error);
  process.exitCode = 1;
});
