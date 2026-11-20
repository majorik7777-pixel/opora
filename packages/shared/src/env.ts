import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().min(1).default("http://localhost:3000"),

  AUTH_SECRET: z.string().min(16, "AUTH_SECRET должен быть не короче 16 символов"),
  ENCRYPTION_KEY: z.string().min(1, "ENCRYPTION_KEY обязателен (base64, 32 байта)"),

  DATABASE_DRIVER: z.enum(["pglite", "postgres"]).default("pglite"),
  DATABASE_URL: z.string().optional(),
  PGLITE_DATA_DIR: z.string().default(".data/dev"),

  AUTO_MIGRATE: z.string().optional(),
  /** Переопределение лимита magic-link с одного IP за минуту (e2e и нагрузочные тесты). */
  MAGIC_LINK_RATE_LIMIT: z.coerce.number().int().positive().optional(),
  AUTH_DEV_SHOW_LINK: z.string().optional(),

  EMAIL_TRANSPORT: z.enum(["console", "smtp"]).default("console"),
  LLM_PROVIDER: z
    .enum([
      "fake",
      "openai-compatible",
      "openrouter",
      "openai",
      "foreign",
      "yandex",
      "gigachat",
      "cloudru",
    ])
    .default("fake"),
  LLM_API_KEY: z.string().optional(),
  LLM_BASE_URL: z.string().optional(),
  LLM_MODEL: z.string().optional(),
});

export interface AppEnv {
  NODE_ENV: "development" | "test" | "production";
  APP_URL: string;
  AUTH_SECRET: string;
  ENCRYPTION_KEY: string;
  DATABASE_DRIVER: "pglite" | "postgres";
  DATABASE_URL: string | undefined;
  PGLITE_DATA_DIR: string;
  EMAIL_TRANSPORT: "console" | "smtp";
  LLM_PROVIDER:
    | "fake"
    | "openai-compatible"
    | "openrouter"
    | "openai"
    | "foreign"
    | "yandex"
    | "gigachat"
    | "cloudru";
  LLM_API_KEY: string | undefined;
  LLM_BASE_URL: string | undefined;
  LLM_MODEL: string | undefined;
  /** Применять миграции при старте: по умолчанию везде, кроме production. */
  autoMigrate: boolean;
  /** Показывать dev-ссылку magic link прямо в интерфейсе (только не в production). */
  showDevMagicLink: boolean;
  /** Лимит запросов magic-link с одного IP в минуту (по умолчанию 5). */
  magicLinkRateLimit: number | undefined;
}

/**
 * Читает и валидирует окружение. Без кэша — безопасно для тестов
 * (env можно менять до первого вызова).
 */
export function getEnv(): AppEnv {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Некорректная конфигурация окружения: ${details}`);
  }

  const data = parsed.data;
  const isProduction = data.NODE_ENV === "production";

  return {
    NODE_ENV: data.NODE_ENV,
    APP_URL: data.APP_URL,
    AUTH_SECRET: data.AUTH_SECRET,
    ENCRYPTION_KEY: data.ENCRYPTION_KEY,
    DATABASE_DRIVER: data.DATABASE_DRIVER,
    DATABASE_URL: data.DATABASE_URL,
    PGLITE_DATA_DIR: data.PGLITE_DATA_DIR,
    EMAIL_TRANSPORT: data.EMAIL_TRANSPORT,
    LLM_PROVIDER: data.LLM_PROVIDER,
    LLM_API_KEY: data.LLM_API_KEY,
    LLM_BASE_URL: data.LLM_BASE_URL,
    LLM_MODEL: data.LLM_MODEL,
    autoMigrate: data.AUTO_MIGRATE
      ? data.AUTO_MIGRATE === "true"
      : !isProduction,
    showDevMagicLink:
      data.AUTH_DEV_SHOW_LINK === "true" ||
      (!isProduction && data.AUTH_DEV_SHOW_LINK !== "false"),
    magicLinkRateLimit: data.MAGIC_LINK_RATE_LIMIT,
  };
}
