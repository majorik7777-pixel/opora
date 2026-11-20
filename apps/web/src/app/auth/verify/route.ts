import { NextResponse, type NextRequest } from "next/server";
import { saveOnboarding, verifyMagicLink } from "@opora/core";
import { COOKIE_NAMES } from "@opora/shared";
import { openJson } from "@opora/shared/server";
import { onboardingDraftCookieOptions, sessionCookieOptions } from "@/lib/cookies";
import { safeNextPath } from "@/lib/navigation";
import { getClientIpHash } from "@/lib/request";

export const dynamic = "force-dynamic";

/**
 * Редирект с относительным Location: хосты в dev/prod могут отличаться
 * (127.0.0.1 vs localhost), абсолютный URL из request.nextUrl ломает cookie.
 */
function relativeRedirect(target: string): NextResponse {
  return new NextResponse(null, {
    status: 303,
    headers: { location: target },
  });
}

/**
 * Проверка magic link: одноразовый токен → сессия (httpOnly cookie) →
 * сохранение черновика онбординга, если он есть → redirect в /app.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  if (!token) {
    return relativeRedirect("/auth?error=missing-token");
  }

  const ipHash = await getClientIpHash();
  const result = await verifyMagicLink(token, { ipHash });
  if (!result.ok) {
    return relativeRedirect("/auth?error=invalid-link");
  }

  let target = safeNextPath(request.nextUrl.searchParams.get("next"));

  const draftToken = request.cookies.get(COOKIE_NAMES.onboardingDraft)?.value;
  if (draftToken) {
    try {
      const draft: unknown = openJson(draftToken);
      const saved = await saveOnboarding(result.data.user.id, draft, {
        ipHash,
      });
      // Новая регистрация → страница успеха: она же служит URL-целью в Метрике
      // (работает даже при включённом блокировщике, в отличие от JS-события).
      if (saved.ok) target = "/welcome";
    } catch (error) {
      // Повреждённый/подменённый черновик не должен ломать вход.
      console.warn(
        "[opora:auth] черновик онбординга не сохранён:",
        error instanceof Error ? error.message : "unknown",
      );
    }
  }

  const response = relativeRedirect(target);
  response.cookies.set(
    COOKIE_NAMES.session,
    result.data.sessionToken,
    sessionCookieOptions(result.data.sessionExpiresAt),
  );
  if (draftToken) {
    response.cookies.set(COOKIE_NAMES.onboardingDraft, "", {
      ...onboardingDraftCookieOptions(),
      expires: new Date(0),
    });
  }

  return response;
}
