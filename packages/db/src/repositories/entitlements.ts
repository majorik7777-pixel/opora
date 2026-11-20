import { and, eq } from "drizzle-orm";
import type { Db } from "../client";
import { entitlements } from "../schema";

export type EntitlementRow = typeof entitlements.$inferSelect;

/** Доступ к программе (T-104). Источник правды — таблица `entitlements`. */

export async function findActiveEntitlement(
  db: Db,
  userId: string,
  programSlug: string,
): Promise<EntitlementRow | null> {
  const rows = await db
    .select()
    .from(entitlements)
    .where(
      and(
        eq(entitlements.userId, userId),
        eq(entitlements.programSlug, programSlug),
        eq(entitlements.status, "active"),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function listEntitlements(
  db: Db,
  userId: string,
): Promise<EntitlementRow[]> {
  return db.select().from(entitlements).where(eq(entitlements.userId, userId));
}

export interface GrantEntitlementInput {
  id: string;
  userId: string;
  programSlug: string;
  source: "dev" | "yookassa";
  externalId?: string | null;
}

/**
 * Выдаёт доступ идемпотентно: повторная покупка той же программы не создаёт
 * вторую строку (уникальный индекс user_id + program_slug).
 */
export async function grantEntitlement(
  db: Db,
  input: GrantEntitlementInput,
): Promise<EntitlementRow> {
  await db
    .insert(entitlements)
    .values({
      id: input.id,
      userId: input.userId,
      programSlug: input.programSlug,
      status: "active",
      source: input.source,
      externalId: input.externalId ?? null,
    })
    .onConflictDoUpdate({
      target: [entitlements.userId, entitlements.programSlug],
      set: { status: "active", source: input.source, externalId: input.externalId ?? null },
    });

  const existing = await findActiveEntitlement(db, input.userId, input.programSlug);
  if (!existing) throw new Error("Не удалось выдать доступ к программе");
  return existing;
}
