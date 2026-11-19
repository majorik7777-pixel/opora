import { and, eq, gt, isNull, lt, or } from "drizzle-orm";
import type { Db } from "../client";
import { authTokens, sessionsAuth, users } from "../schema";

export type UserRow = typeof users.$inferSelect;
export type SessionRow = typeof sessionsAuth.$inferSelect;
export type AuthTokenRow = typeof authTokens.$inferSelect;

export async function findUserById(
  db: Db,
  id: string,
): Promise<UserRow | null> {
  const rows = await db
    .select()
    .from(users)
    .where(and(eq(users.id, id), isNull(users.deletedAt)))
    .limit(1);
  return rows[0] ?? null;
}

export async function findUserByEmailHmac(
  db: Db,
  emailHmac: string,
): Promise<UserRow | null> {
  const rows = await db
    .select()
    .from(users)
    .where(and(eq(users.emailHmac, emailHmac), isNull(users.deletedAt)))
    .limit(1);
  return rows[0] ?? null;
}

/** Идемпотентно находит или создаёт пользователя по HMAC-отпечатку email. */
export async function findOrCreateUser(
  db: Db,
  input: { id: string; emailEnc: string; emailHmac: string },
): Promise<UserRow> {
  const inserted = await db
    .insert(users)
    .values(input)
    .onConflictDoNothing({ target: users.emailHmac })
    .returning();

  const created = inserted[0];
  if (created) return created;

  const existing = await findUserByEmailHmac(db, input.emailHmac);
  if (!existing) {
    throw new Error("Не удалось создать пользователя: конфликт без существующей записи");
  }
  return existing;
}

export async function createAuthToken(
  db: Db,
  input: {
    id: string;
    emailEnc: string;
    emailHmac: string;
    tokenHash: string;
    expiresAt: Date;
  },
): Promise<void> {
  await db.insert(authTokens).values(input);
}

/**
 * Атомарно "сжигает" magic-link токен. Возвращает строку, только если токен
 * существовал, не истёк и ещё не использован.
 */
export async function consumeAuthToken(
  db: Db,
  tokenHash: string,
  now: Date = new Date(),
): Promise<AuthTokenRow | null> {
  const rows = await db
    .update(authTokens)
    .set({ consumedAt: now })
    .where(
      and(
        eq(authTokens.tokenHash, tokenHash),
        isNull(authTokens.consumedAt),
        gt(authTokens.expiresAt, now),
      ),
    )
    .returning();
  return rows[0] ?? null;
}

/** Удаляет старые magic-link токены, чтобы таблица не росла. */
export async function deleteStaleAuthTokens(
  db: Db,
  now: Date = new Date(),
): Promise<void> {
  await db
    .delete(authTokens)
    .where(
      and(
        lt(authTokens.expiresAt, new Date(now.getTime() - 24 * 60 * 60 * 1000)),
        or(isNull(authTokens.consumedAt), lt(authTokens.consumedAt, now)),
      ),
    );
}

export async function createSession(
  db: Db,
  input: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    ipHash?: string | null;
  },
): Promise<void> {
  await db.insert(sessionsAuth).values({
    id: input.id,
    userId: input.userId,
    tokenHash: input.tokenHash,
    expiresAt: input.expiresAt,
    ipHash: input.ipHash ?? null,
  });
}

/** Находит пользователя по хешу токена сессии, если сессия активна. */
export async function findSessionUser(
  db: Db,
  tokenHash: string,
  now: Date = new Date(),
): Promise<{ user: UserRow; session: SessionRow } | null> {
  const rows = await db
    .select({ user: users, session: sessionsAuth })
    .from(sessionsAuth)
    .innerJoin(users, eq(sessionsAuth.userId, users.id))
    .where(
      and(
        eq(sessionsAuth.tokenHash, tokenHash),
        isNull(sessionsAuth.revokedAt),
        gt(sessionsAuth.expiresAt, now),
        isNull(users.deletedAt),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function revokeSession(
  db: Db,
  tokenHash: string,
  now: Date = new Date(),
): Promise<void> {
  await db
    .update(sessionsAuth)
    .set({ revokedAt: now })
    .where(and(eq(sessionsAuth.tokenHash, tokenHash), isNull(sessionsAuth.revokedAt)));
}
