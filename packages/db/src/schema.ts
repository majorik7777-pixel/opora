import { boolean, date, index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

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

/**
 * Каталог программ (D-035): одна платформа — много программ. Программа — это
 * контент и запись в каталоге, а не отдельный продукт. Даже когда программа
 * одна, строка в каталоге существует: на неё ссылаются доступы, тред чата,
 * дневник и SEO-страницы (`docs/product/scalability.md`).
 */
export const programs = pgTable(
  "programs",
  {
    id: uuid("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    /** Короткое описание для каталога и карточки. */
    summary: text("summary").notNull().default(""),
    /** draft | published | archived — что показывать в каталоге и sitemap. */
    status: text("status").notNull().default("draft"),
    /** Цена в рублях; 0 — бесплатно. */
    priceRub: integer("price_rub").notNull().default(0),
    /** Версия контента программы: позволяет обновлять тексты без сброса прогресса. */
    contentVersion: text("content_version").notNull().default("v1"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("programs_slug_uq").on(table.slug),
    index("programs_status_idx").on(table.status),
  ],
);

/**
 * Чат (T-101). Один тред на пользователя в Phase 1; текст сообщений хранится
 * только в зашифрованном виде (content_enc, AES-256-GCM), см. ADR-0003.
 * `program_slug` — контекст разговора (nullable): программа не создаёт второй
 * тред, она задаёт фокус (`docs/product/scalability.md` §3).
 */
export const chatThreads = pgTable(
  "chat_threads",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    programSlug: text("program_slug"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("chat_threads_user_id_idx").on(table.userId)],
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").primaryKey(),
    threadId: uuid("thread_id")
      .notNull()
      .references(() => chatThreads.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    contentEnc: text("content_enc").notNull(),
    /** "ok" | "risk" — результат safety-хука до генерации (T-105 расширит). */
    safetyFlag: text("safety_flag"),
    provider: text("provider"),
    model: text("model"),
    tokens: integer("tokens"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("chat_messages_thread_created_idx").on(table.threadId, table.createdAt),
    index("chat_messages_user_created_idx").on(table.userId, table.createdAt),
  ],
);

/**
 * Доступ к программе (T-104). В DEV-режиме выдаётся серверным действием
 * `startDevPurchase`, в production — вебхуком платёжного провайдера.
 */
export const entitlements = pgTable(
  "entitlements",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    programSlug: text("program_slug").notNull(),
    status: text("status").notNull().default("active"),
    /** dev | yookassa — откуда появился доступ. */
    source: text("source").notNull(),
    externalId: text("external_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("entitlements_user_program_uq").on(table.userId, table.programSlug),
    index("entitlements_user_idx").on(table.userId),
  ],
);

/**
 * Дневник (T-102). Текст записи хранится только зашифрованным (text_enc),
 * теги — из фиксированного списка, мягкое удаление через deleted_at.
 */
export const diaryEntries = pgTable(
  "diary_entries",
  {
    id: uuid("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    entryDate: date("entry_date").notNull(),
    mood: integer("mood").notNull(),
    textEnc: text("text_enc"),
    tags: text("tags").array().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("diary_entries_user_date_idx").on(table.userId, table.entryDate),
  ],
);

export const schema = {
  users,
  authTokens,
  sessionsAuth,
  consents,
  onboardingAnswers,
  programs,
  chatThreads,
  chatMessages,
  entitlements,
  diaryEntries,
};
