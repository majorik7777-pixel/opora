import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@opora/core";
import { COOKIE_NAMES, type CurrentUser } from "@opora/shared";

/** Текущий пользователь по httpOnly-cookie сессии (или null). */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const store = await cookies();
  return getSessionUser(store.get(COOKIE_NAMES.session)?.value ?? null);
}

/** Требует вход; иначе уводит на /auth с возвратом в /app. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/auth?next=${encodeURIComponent("/app")}`);
  }
  return user;
}

/** Требует вход + пройденный онбординг (для /app). */
export async function requireOnboardedUser(): Promise<CurrentUser> {
  const user = await requireUser();
  if (!user.hasCompletedOnboarding) {
    redirect("/onboarding");
  }
  return user;
}
