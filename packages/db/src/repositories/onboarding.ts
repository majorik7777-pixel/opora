import { and, eq } from "drizzle-orm";
import type { Db } from "../client";
import { consents, onboardingAnswers, users } from "../schema";

export type OnboardingAnswersRow = typeof onboardingAnswers.$inferSelect;
export type ConsentRow = typeof consents.$inferSelect;

export interface SaveOnboardingBundleInput {
  answers: {
    id: string;
    userId: string;
    answersEnc: string;
    version: string;
    completedAt: Date;
  };
  consents: Array<{
    id: string;
    userId: string;
    kind: string;
    version: string;
    acceptedAt: Date;
    ipHash: string | null;
  }>;
  ageConfirmed: boolean;
}

/**
 * Сохраняет ответы онбординга, согласия и отметку 18+ одной транзакцией.
 * Повторный вызов (например, после повторного прохождения) перезаписывает
 * ответы, но согласия не дублирует.
 */
export async function saveOnboardingBundle(
  db: Db,
  input: SaveOnboardingBundleInput,
): Promise<void> {
  const now = new Date();

  await db.transaction(async (tx) => {
    await tx
      .insert(onboardingAnswers)
      .values({
        id: input.answers.id,
        userId: input.answers.userId,
        answersEnc: input.answers.answersEnc,
        version: input.answers.version,
        completedAt: input.answers.completedAt,
      })
      .onConflictDoUpdate({
        target: onboardingAnswers.userId,
        set: {
          answersEnc: input.answers.answersEnc,
          version: input.answers.version,
          completedAt: input.answers.completedAt,
          updatedAt: now,
        },
      });

    if (input.consents.length > 0) {
      await tx
        .insert(consents)
        .values(input.consents)
        .onConflictDoNothing({
          target: [consents.userId, consents.kind, consents.version],
        });
    }

    await tx
      .update(users)
      .set({ ageConfirmed: input.ageConfirmed, updatedAt: now })
      .where(eq(users.id, input.answers.userId));
  });
}

export async function findOnboardingAnswers(
  db: Db,
  userId: string,
): Promise<OnboardingAnswersRow | null> {
  const rows = await db
    .select()
    .from(onboardingAnswers)
    .where(eq(onboardingAnswers.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function hasCompletedOnboarding(
  db: Db,
  userId: string,
): Promise<boolean> {
  return (await findOnboardingAnswers(db, userId)) !== null;
}

export async function listConsents(
  db: Db,
  userId: string,
): Promise<ConsentRow[]> {
  return db
    .select()
    .from(consents)
    .where(and(eq(consents.userId, userId)))
    .orderBy(consents.acceptedAt);
}
