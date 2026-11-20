import { sql } from "drizzle-orm";
import { createDbHandle, type DbHandle } from "./client";
import { runMigrations } from "./migrations";

/** Тестовая БД: in-memory PGlite + применённые миграции. */
export async function createTestDatabase(): Promise<DbHandle> {
  const handle = await createDbHandle({
    driver: "pglite",
    pgliteDataDir: ":memory:",
  });
  await runMigrations(handle.db);
  return handle;
}

/** Количество строк в таблице — для проверок в интеграционных тестах. */
export async function countRows(
  handle: DbHandle,
  table:
    | "users"
    | "auth_tokens"
    | "sessions_auth"
    | "consents"
    | "onboarding_answers"
    | "chat_threads"
    | "chat_messages"
    | "entitlements"
    | "_opora_migrations",
): Promise<number> {
  const result = await handle.db.execute(
    sql.raw(`SELECT count(*)::int AS count FROM "${table}"`),
  );
  const rows = (result as unknown as { rows?: Array<{ count: number }> }).rows ?? [];
  return rows[0]?.count ?? 0;
}
