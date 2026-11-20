import { and, asc, count, desc, eq, gte } from "drizzle-orm";
import type { Db } from "../client";
import { chatMessages, chatThreads } from "../schema";

export type ChatThreadRow = typeof chatThreads.$inferSelect;
export type ChatMessageRow = typeof chatMessages.$inferSelect;

/**
 * Репозиторий чата (T-101). Никакой логики лимитов и safety — только данные:
 * тред, сообщения, выборки для контекста и дневного счётчика.
 */

/** Возвращает тред пользователя, создавая его при первом обращении. */
export async function ensureChatThread(
  db: Db,
  input: { id: string; userId: string; now?: Date },
): Promise<ChatThreadRow> {
  const now = input.now ?? new Date();
  await db
    .insert(chatThreads)
    .values({ id: input.id, userId: input.userId, createdAt: now, updatedAt: now })
    .onConflictDoNothing({ target: chatThreads.userId });

  const rows = await db
    .select()
    .from(chatThreads)
    .where(eq(chatThreads.userId, input.userId))
    .limit(1);

  const thread = rows[0];
  if (!thread) {
    throw new Error("Не удалось создать тред чата");
  }
  return thread;
}

export async function findChatThread(
  db: Db,
  userId: string,
): Promise<ChatThreadRow | null> {
  const rows = await db
    .select()
    .from(chatThreads)
    .where(eq(chatThreads.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

export interface InsertChatMessageInput {
  id: string;
  threadId: string;
  userId: string;
  role: "user" | "assistant";
  contentEnc: string;
  safetyFlag?: string | null;
  provider?: string | null;
  model?: string | null;
  tokens?: number | null;
  createdAt?: Date;
}

export async function insertChatMessage(
  db: Db,
  input: InsertChatMessageInput,
): Promise<ChatMessageRow> {
  const createdAt = input.createdAt ?? new Date();
  const rows = await db
    .insert(chatMessages)
    .values({
      id: input.id,
      threadId: input.threadId,
      userId: input.userId,
      role: input.role,
      contentEnc: input.contentEnc,
      safetyFlag: input.safetyFlag ?? null,
      provider: input.provider ?? null,
      model: input.model ?? null,
      tokens: input.tokens ?? null,
      createdAt,
    })
    .returning();

  const row = rows[0];
  if (!row) throw new Error("Не удалось сохранить сообщение чата");

  await db
    .update(chatThreads)
    .set({ updatedAt: createdAt })
    .where(eq(chatThreads.id, input.threadId));

  return row;
}

/** Последние N сообщений треда в хронологическом порядке (для контекста). */
export async function listRecentChatMessages(
  db: Db,
  threadId: string,
  limit: number,
): Promise<ChatMessageRow[]> {
  const rows = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.threadId, threadId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);

  return rows.reverse();
}

/** Вся история треда, от старых к новым (для экрана чата). */
export async function listChatMessages(
  db: Db,
  threadId: string,
): Promise<ChatMessageRow[]> {
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.threadId, threadId))
    .orderBy(asc(chatMessages.createdAt));
}

/** Сколько сообщений пользователя отправлено с момента `since` (дневной лимит). */
export async function countUserChatMessagesSince(
  db: Db,
  userId: string,
  since: Date,
): Promise<number> {
  const rows = await db
    .select({ value: count() })
    .from(chatMessages)
    .where(
      and(
        eq(chatMessages.userId, userId),
        eq(chatMessages.role, "user"),
        gte(chatMessages.createdAt, since),
      ),
    );

  return Number(rows[0]?.value ?? 0);
}
