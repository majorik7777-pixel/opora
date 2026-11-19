import { getDb } from "@opora/db";
import { pingDatabase } from "@opora/db";

/** Проверка доступности БД для /api/health. */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    const db = await getDb();
    await pingDatabase(db);
    return true;
  } catch (error) {
    console.error("[opora:health] БД недоступна", error instanceof Error ? error.message : "unknown");
    return false;
  }
}
