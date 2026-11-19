import { AUTH_TTL, COOKIE_NAMES } from "@opora/shared";
import { getEnv } from "@opora/shared/server";

export { COOKIE_NAMES };

export interface CookieOptions {
  httpOnly: boolean;
  sameSite: "lax";
  secure: boolean;
  path: string;
  expires: Date;
}

function isSecure(): boolean {
  return getEnv().APP_URL.startsWith("https://");
}

/** Cookie серверной сессии: httpOnly, SameSite=Lax, secure только по https. */
export function sessionCookieOptions(expiresAt: Date): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure(),
    path: "/",
    expires: expiresAt,
  };
}

/** Cookie черновика онбординга до входа: живёт AUTH_TTL.onboardingDraftMinutes. */
export function onboardingDraftCookieOptions(now: Date = new Date()): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isSecure(),
    path: "/",
    expires: new Date(
      now.getTime() + AUTH_TTL.onboardingDraftMinutes * 60_000,
    ),
  };
}
