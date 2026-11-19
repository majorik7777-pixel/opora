import { boolean, index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

/**
 * Схема БД Phase 0–1 (12-tech-plan.md §4, уточнения в ADR-0002/0003).
 * id — UUID v7, генерируется приложением (packages/shared/server → uuidv7).
 * Чувствительные поля хранятся в зашифрованном виде (AES-256-GCM):
 * email_enc, answers_enc. Для поиска email используется HMAC-отпечаток.
 */

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(),
    emailEnc: text("email_enc").notNull(),
    emailHmac: text("email_hmac").notNull(),
    status: text("status").notNull().default("active"),
    ageConfirmed: boolean("age_confirmed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("users_email_hmac_uq").on(table.emailHmac),
    index("users_status_idx").on(table.status),
  ],
);

/** Одноразовые токены magic link: в БД только sha256-хеш, TTL 20 минут. */
export const authTokens = pgTable(
  "auth_tokens",
  {
    id: uuid("id").primaryKey(),
    emailEnc: text("email_enc").notNull(),
    emailHmac: text("email_hmac").notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("auth_tokens_token_hash_uq").on(table.tokenHash),
    index("auth_tokens_email_hmac_idx").on(table.emailHmac),
  ],
);

/** Серверные сессии: в БД только sha256-хеш токена, TTL 30 дней, cookie httpOnly. */
export const sessionsAuth = pgTable(
  "sessions_auth",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ipHash: text("ip_hash"),
  },
  (table) => [
    uniqueIndex("sessions_auth_token_hash_uq").on(table.tokenHash),
    index("sessions_auth_user_id_idx").on(table.userId),
  ],
);

/** Согласия с версиями документов (152-ФЗ, спец. категория). */
export const consents = pgTable(
  "consents",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    version: text("version").notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }).notNull(),
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("consents_user_kind_version_uq").on(table.userId, table.kind, table.version),
    index("consents_user_id_idx").on(table.userId),
  ],
);

/** Ответы онбординга: весь объект ответов (спец. категория) хранится зашифрованным. */
export const onboardingAnswers = pgTable(
  "onboarding_answers",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    answersEnc: text("answers_enc").notNull(),
    version: text("version").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("onboarding_answers_user_id_idx").on(table.userId)],
);

export const schema = {
  users,
  authTokens,
  sessionsAuth,
  consents,
  onboardingAnswers,
};
