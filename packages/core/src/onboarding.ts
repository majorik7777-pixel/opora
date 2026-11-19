import {
  CONSENT_VERSION,
  ONBOARDING_VERSION,
  actionFail,
  actionOk,
  onboardingDraftSchema,
  type ActionResult,
  type OnboardingAnswers,
  type OnboardingProfile,
} from "@opora/shared";
import { findOnboardingAnswers, getDb, saveOnboardingBundle } from "@opora/db";
import { openJson, sealJson, uuidv7 } from "@opora/shared/server";

/**
 * Сохраняет пройденный онбординг: расшифрованный черновик шифруется заново и
 * пишется вместе с согласиями и отметкой 18+ одной транзакцией.
 */
export async function saveOnboarding(
  userId: string,
  draft: unknown,
  meta: { ipHash?: string | null } = {},
): Promise<ActionResult<{ completedAt: string }>> {
  const parsed = onboardingDraftSchema.safeParse(draft);
  if (!parsed.success) {
    return actionFail(
      "VALIDATION",
      "Ответы онбординга неполные или некорректные",
    );
  }

  const { answers, consents, acceptedAt } = parsed.data;
  const db = await getDb();
  const now = new Date();
  const acceptedDate = new Date(acceptedAt);
  const acceptedSafe = Number.isNaN(acceptedDate.getTime()) ? now : acceptedDate;
  const ipHash = meta.ipHash ?? null;

  await saveOnboardingBundle(db, {
    answers: {
      id: uuidv7(),
      userId,
      answersEnc: sealJson(answers),
      version: ONBOARDING_VERSION,
      completedAt: now,
    },
    consents: [
      {
        id: uuidv7(),
        userId,
        kind: "processing",
        version: CONSENT_VERSION,
        acceptedAt: acceptedSafe,
        ipHash,
      },
      {
        id: uuidv7(),
        userId,
        kind: "special",
        version: CONSENT_VERSION,
        acceptedAt: acceptedSafe,
        ipHash,
      },
    ],
    ageConfirmed: consents.age,
  });

  return actionOk({ completedAt: now.toISOString() });
}

/** Профиль онбординга для персонализации /app. */
export async function getOnboardingProfile(
  userId: string,
): Promise<OnboardingProfile | null> {
  const db = await getDb();
  const row = await findOnboardingAnswers(db, userId);
  if (!row) return null;

  return {
    answers: openJson<OnboardingAnswers>(row.answersEnc),
    completedAt: row.completedAt.toISOString(),
  };
}

export async function hasOnboardingProfile(userId: string): Promise<boolean> {
  const db = await getDb();
  return (await findOnboardingAnswers(db, userId)) !== null;
}
