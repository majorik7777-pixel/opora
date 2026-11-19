"use server";

import { cookies } from "next/headers";
import { getSessionUser, saveOnboarding } from "@opora/core";
import {
  COOKIE_NAMES,
  actionFail,
  actionOk,
  onboardingDraftSchema,
  type ActionResult,
} from "@opora/shared";
import { sealJson } from "@opora/shared/server";
import { onboardingDraftCookieOptions } from "@/lib/cookies";
import { getClientIpHash } from "@/lib/request";

export interface SubmitOnboardingResult {
  redirectTo: string;
}

/**
 * Server action онбординга.
 * - залогинен: сохраняем в БД и ведём в /app;
 * - гость: шифруем черновик в httpOnly-cookie и ведём на /auth,
 *   после входа черновик сохранится в БД (см. /auth/verify).
 */
export async function submitOnboardingAction(
  input: unknown,
): Promise<ActionResult<SubmitOnboardingResult>> {
  const parsed = onboardingDraftSchema.safeParse(input);
  if (!parsed.success) {
    return actionFail("VALIDATION", "Проверь ответы — что-то потерялось");
  }

  const store = await cookies();
  const sessionToken = store.get(COOKIE_NAMES.session)?.value;
  const user = await getSessionUser(sessionToken);
  const ipHash = await getClientIpHash();

  if (user) {
    const saved = await saveOnboarding(user.id, parsed.data, { ipHash });
    if (!saved.ok) {
      return actionFail(saved.code, saved.message);
    }
    return actionOk({ redirectTo: "/app" });
  }

  store.set(
    COOKIE_NAMES.onboardingDraft,
    sealJson(parsed.data),
    onboardingDraftCookieOptions(),
  );
  return actionOk({ redirectTo: `/auth?next=${encodeURIComponent("/app")}` });
}
