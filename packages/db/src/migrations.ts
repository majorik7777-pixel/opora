import { sql } from "drizzle-orm";
import type { Db } from "./client";

/**
 * Миграции Phase 0–1.
 *
 * SQL лежит в коде, а не в отдельных файлах: приложение запускается и в Next.js
 * (bundled), и в скрипте, и в тестах — чтение файлов с диска усложнило бы
 * деплой. Для пользователей Drizzle (db:generate) SQL остаётся прозрачным;
 * при росте схемы миграции переедут в файловый раннер (см. tasks/T-101+).
 *
 * Каждая миграция применяется в транзакции и отмечается в _opora_migrations.
 */
export interface Migration {
  id: string;
  statements: readonly string[];
}

export const MIGRATIONS: readonly Migration[] = [
  {
    id: "0000_init",
    statements: [
      `CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY NOT NULL,
        "email_enc" text NOT NULL,
        "email_hmac" text NOT NULL,
        "status" text DEFAULT 'active' NOT NULL,
        "age_confirmed" boolean DEFAULT false NOT NULL,
        "created_at" timestamptz DEFAULT now() NOT NULL,
        "updated_at" timestamptz DEFAULT now() NOT NULL,
        "deleted_at" timestamptz
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "users_email_hmac_uq" ON "users" ("email_hmac")`,
      `CREATE INDEX IF NOT EXISTS "users_status_idx" ON "users" ("status")`,
      `CREATE TABLE IF NOT EXISTS "auth_tokens" (
        "id" uuid PRIMARY KEY NOT NULL,
        "email_enc" text NOT NULL,
        "email_hmac" text NOT NULL,
        "token_hash" text NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "created_at" timestamptz DEFAULT now() NOT NULL,
        "consumed_at" timestamptz
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "auth_tokens_token_hash_uq" ON "auth_tokens" ("token_hash")`,
      `CREATE INDEX IF NOT EXISTS "auth_tokens_email_hmac_idx" ON "auth_tokens" ("email_hmac")`,
      `CREATE TABLE IF NOT EXISTS "sessions_auth" (
        "id" uuid PRIMARY KEY NOT NULL,
        "user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
        "token_hash" text NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "created_at" timestamptz DEFAULT now() NOT NULL,
        "revoked_at" timestamptz,
        "ip_hash" text
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "sessions_auth_token_hash_uq" ON "sessions_auth" ("token_hash")`,
      `CREATE INDEX IF NOT EXISTS "sessions_auth_user_id_idx" ON "sessions_auth" ("user_id")`,
      `CREATE TABLE IF NOT EXISTS "consents" (
        "id" uuid PRIMARY KEY NOT NULL,
        "user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
        "kind" text NOT NULL,
        "version" text NOT NULL,
        "accepted_at" timestamptz NOT NULL,
        "ip_hash" text,
        "created_at" timestamptz DEFAULT now() NOT NULL
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "consents_user_kind_version_uq" ON "consents" ("user_id", "kind", "version")`,
      `CREATE INDEX IF NOT EXISTS "consents_user_id_idx" ON "consents" ("user_id")`,
      `CREATE TABLE IF NOT EXISTS "onboarding_answers" (
        "id" uuid PRIMARY KEY NOT NULL,
        "user_id" uuid NOT NULL UNIQUE REFERENCES "users" ("id") ON DELETE CASCADE,
        "answers_enc" text NOT NULL,
        "version" text NOT NULL,
        "completed_at" timestamptz NOT NULL,
        "created_at" timestamptz DEFAULT now() NOT NULL,
        "updated_at" timestamptz DEFAULT now() NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS "onboarding_answers_user_id_idx" ON "onboarding_answers" ("user_id")`,
    ],
  },
  {
    id: "0001_chat",
    statements: [
      `CREATE TABLE IF NOT EXISTS "chat_threads" (
        "id" uuid PRIMARY KEY NOT NULL,
        "user_id" uuid NOT NULL UNIQUE REFERENCES "users" ("id") ON DELETE CASCADE,
        "created_at" timestamptz DEFAULT now() NOT NULL,
        "updated_at" timestamptz DEFAULT now() NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS "chat_threads_user_id_idx" ON "chat_threads" ("user_id")`,
      `CREATE TABLE IF NOT EXISTS "chat_messages" (
        "id" uuid PRIMARY KEY NOT NULL,
        "thread_id" uuid NOT NULL REFERENCES "chat_threads" ("id") ON DELETE CASCADE,
        "user_id" uuid NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
        "role" text NOT NULL,
        "content_enc" text NOT NULL,
        "safety_flag" text,
        "provider" text,
        "model" text,
        "tokens" integer,
        "created_at" timestamptz DEFAULT now() NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS "chat_messages_thread_created_idx" ON "chat_messages" ("thread_id", "created_at")`,
      `CREATE INDEX IF NOT EXISTS "chat_messages_user_created_idx" ON "chat_messages" ("user_id", "created_at")`,
    ],
  },
];

const MIGRATIONS_TABLE = `CREATE TABLE IF NOT EXISTS "_opora_migrations" (
  "id" text PRIMARY KEY NOT NULL,
  "applied_at" timestamptz DEFAULT now() NOT NULL
)`;

/** Применяет неприменённые миграции (идемпотентно). */
export async function runMigrations(db: Db): Promise<void> {
  await db.execute(sql.raw(MIGRATIONS_TABLE));

  const appliedResult = await db.execute(
    sql.raw(`SELECT "id" FROM "_opora_migrations"`),
  );
  const rows =
    (appliedResult as unknown as { rows?: Array<{ id: string }> }).rows ?? [];
  const applied = new Set(rows.map((row) => row.id));

  for (const migration of MIGRATIONS) {
    if (applied.has(migration.id)) continue;

    await db.transaction(async (tx) => {
      for (const statement of migration.statements) {
        await tx.execute(sql.raw(statement));
      }
      await tx.execute(
        sql`INSERT INTO "_opora_migrations" ("id") VALUES (${migration.id})`,
      );
    });
  }
}
