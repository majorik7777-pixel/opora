import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getEnv } from "@opora/shared/server";
import * as schema from "./schema";

/**
 * Db — единый тип для Drizzle поверх PostgreSQL и PGlite.
 * Драйверы имеют почти идентичный API; для наших запросов он совпадает,
 * поэтому тип нормализован к node-postgres (ADR-0002).
 */
export type Db = NodePgDatabase<typeof schema>;

export interface DbHandle {
  db: Db;
  driver: "pglite" | "postgres";
  close: () => Promise<void>;
}

export interface CreateDbOptions {
  driver?: "pglite" | "postgres";
  databaseUrl?: string;
  pgliteDataDir?: string;
}

interface DbGlobalState {
  __oporaDbHandle?: Promise<DbHandle>;
  __oporaDbMigrated?: boolean;
}

const globalState = globalThis as typeof globalThis & DbGlobalState;

/** Ищем корень pnpm-workspace, чтобы относительные пути (PGLITE_DATA_DIR) были одинаковыми из apps/web и из скриптов. */
function findWorkspaceRoot(): string {
  let dir = process.cwd();
  for (let depth = 0; depth < 6; depth += 1) {
    if (existsSync(path.join(dir, "pnpm-workspace.yaml"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

export function resolvePgliteDataDir(configured: string): string {
  if (configured === ":memory:" || configured.length === 0) {
    return configured;
  }
  if (path.isAbsolute(configured)) {
    return configured;
  }
  return path.resolve(findWorkspaceRoot(), configured);
}

/** Создаёт новое подключение к БД (без глобального состояния — для тестов и скриптов). */
export async function createDbHandle(
  options: CreateDbOptions = {},
): Promise<DbHandle> {
  let driver = options.driver;
  let databaseUrl = options.databaseUrl;
  let pgliteDataDir = options.pgliteDataDir;

  if (!driver || (driver === "pglite" && !pgliteDataDir) || (driver === "postgres" && !databaseUrl)) {
    const env = getEnv();
    driver ??= env.DATABASE_DRIVER;
    databaseUrl ??= env.DATABASE_URL;
    pgliteDataDir ??= env.PGLITE_DATA_DIR;
  }

  const resolvedDriver = driver ?? "pglite";

  if (resolvedDriver === "postgres") {
    if (!databaseUrl) {
      throw new Error(
        "DATABASE_DRIVER=postgres, но DATABASE_URL не задан. Укажи строку подключения к PostgreSQL.",
      );
    }
    const pool = new Pool({
      connectionString: databaseUrl,
      max: 10,
      idleTimeoutMillis: 30_000,
    });
    const db = drizzlePg(pool, { schema }) as unknown as Db;
    return {
      db,
      driver: resolvedDriver,
      close: async () => {
        await pool.end();
      },
    };
  }

  const resolvedDir = resolvePgliteDataDir(pgliteDataDir ?? ":memory:");
  // PGlite создаёт файл БД в указанном каталоге, но не создаёт родительские
  // каталоги — делаем это сами (например, .data/ в корне репозитория).
  if (resolvedDir !== ":memory:") {
    mkdirSync(path.dirname(resolvedDir), { recursive: true });
  }
  const client =
    resolvedDir === ":memory:" ? new PGlite() : new PGlite(resolvedDir);
  await client.waitReady;
  const db = drizzlePglite(client, { schema }) as unknown as Db;

  return {
    db,
    driver: resolvedDriver,
    close: async () => {
      await client.close();
    },
  };
}

/** Singleton-подключение процесса (переживает HMR в Next dev). */
export async function getDbHandle(): Promise<DbHandle> {
  globalState.__oporaDbHandle ??= createDbHandle();
  return globalState.__oporaDbHandle;
}

export async function getDb(): Promise<Db> {
  const handle = await getDbHandle();
  return handle.db;
}

export async function closeDb(): Promise<void> {
  const pending = globalState.__oporaDbHandle;
  globalState.__oporaDbHandle = undefined;
  globalState.__oporaDbMigrated = false;
  if (pending) {
    const handle = await pending;
    await handle.close();
  }
}

/**
 * Готовит БД к работе: создаёт подключение и применяет миграции.
 * Вызывается из instrumentation.ts при AUTO_MIGRATE=true и из тестов.
 */
export async function ensureDatabaseReady(): Promise<Db> {
  const handle = await getDbHandle();
  if (!globalState.__oporaDbMigrated) {
    const { runMigrations } = await import("./migrations");
    await runMigrations(handle.db);
    globalState.__oporaDbMigrated = true;
  }
  return handle.db;
}
