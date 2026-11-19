import { sql } from "drizzle-orm";
import type { Db } from "./client";

/** Простейшая проверка живости БД для /api/health и мониторинга. */
export async function pingDatabase(db: Db): Promise<void> {
  await db.execute(sql`select 1`);
}
