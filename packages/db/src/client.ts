import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
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
  __oporaDbReady?: Promise<void>;
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

/**
 * Создаёт новое подключение к БД (без глобального состояния — для тестов и скриптов).
 * Драйверы импортируются динамически: pg не попадает в бандл, если используется
 * PGlite, и наоборот (важно для dev-сборки Next).
 */
export async function createDbHandle(
  options: CreateDbOptions = {},
): Promise<DbHandle> {
  let driver = options.driver;
  let databaseUrl = options.databaseUrl;
  let pgliteDataDir = options.pgliteDataDir;

  if (
    !driver ||
    (driver === "pglite" && !pgliteDataDir) ||
    (driver === "postgres" && !databaseUrl)
  ) {
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

    const [{ Pool }, { drizzle }] = await Promise.all([
      import("pg"),
      import("drizzle-orm/node-postgres"),
    ]);
    const pool = new Pool({
      connectionString: databaseUrl,
      max: 10,
      idleTimeoutMillis: 30_000,
    });
    const db = drizzle(pool, { schema }) as unknown as Db;

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

  const [{ PGlite }, { drizzle }] = await Promise.all([
    import("@electric-sql/pglite"),
    import("drizzle-orm/pglite"),
  ]);
  const client =
    resolvedDir === ":memory:" ? new PGlite() : new PGlite(resolvedDir);
  await client.waitReady;
  const db = drizzle(client, { schema }) as unknown as Db;

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

/**
 * Готовит БД к работе (миграции) один раз на процесс.
 * Вызывается лениво при первом обращении к БД, если AUTO_MIGRATE=true,
 * и явно из тестов/скриптов через ensureDatabaseReady.
 */
async function ensureMigrated(handle: DbHandle): Promise<void> {
  if (!getEnv().autoMigrate) return;

  globalState.__oporaDbReady ??= (async () => {
    const { runMigrations } = await import("./migrations");
    await runMigrations(handle.db);
    console.info("[opora:db] миграции применены");
  })();
  await globalState.__oporaDbReady;
}

export async function getDb(): Promise<Db> {
  const handle = await getDbHandle();
  await ensureMigrated(handle);
  return handle.db;
}

export async function closeDb(): Promise<void> {
  const pending = globalState.__oporaDbHandle;
  globalState.__oporaDbHandle = undefined;
  globalState.__oporaDbReady = undefined;
  if (pending) {
    const handle = await pending;
    await handle.close();
  }
}

/** Явно применяет миграции (тесты, healthcheck после сбоя, ручной прогрев). */
export async function ensureDatabaseReady(): Promise<Db> {
  const handle = await getDbHandle();
  globalState.__oporaDbReady ??= (async () => {
    const { runMigrations } = await import("./migrations");
    await runMigrations(handle.db);
  })();
  await globalState.__oporaDbReady;
  return handle.db;
}
