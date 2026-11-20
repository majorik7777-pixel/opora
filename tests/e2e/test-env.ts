import path from "node:path";

/** Базовый URL e2e-сервера (порт не пересекается с dev-сервером на 3000). */
export const E2E_BASE_URL = `http://127.0.0.1:${process.env.E2E_PORT ?? 3100}`;

/** Отдельная PGlite-директория на прогон e2e; чистится перед стартом сервера. */
export const E2E_DATA_DIR = path.resolve(__dirname, "../../.data/e2e");

/** Детерминированные ключи только для e2e/dev-окружения. */
export const E2E_ENV = {
  APP_URL: E2E_BASE_URL,
  DATABASE_DRIVER: "pglite",
  PGLITE_DATA_DIR: E2E_DATA_DIR,
  AUTO_MIGRATE: "true",
  AUTH_DEV_SHOW_LINK: "true",
  EMAIL_TRANSPORT: "console",
  LLM_PROVIDER: "fake",
  // e2e логинится в каждом тесте: лимит magic-link с одного IP поднимаем, иначе
  // 6-й+ тест в минуту получает «Слишком много попыток».
  MAGIC_LINK_RATE_LIMIT: "100",
  AUTH_SECRET: "e2e-auth-secret-not-for-production-0001",
  ENCRYPTION_KEY: Buffer.alloc(32, 7).toString("base64"),
  NEXT_TELEMETRY_DISABLED: "1",
} satisfies Record<string, string>;
