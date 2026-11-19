import {
  AUTH_TTL,
  RATE_LIMITS,
  actionFail,
  actionOk,
  emailSchema,
  type ActionResult,
  type CurrentUser,
  type UserStatus,
} from "@opora/shared";
import {
  consumeAuthToken,
  createAuthToken,
  createSession,
  deleteStaleAuthTokens,
  findOrCreateUser,
  findSessionUser,
  hasCompletedOnboarding,
  revokeSession,
  getDb,
  type UserRow,
} from "@opora/db";
import {
  getEnv,
  hashEmail,
  openText,
  randomToken,
  sealText,
  sha256Hex,
  uuidv7,
} from "@opora/shared/server";
import { createMailer } from "./mailer";
import { consumeRateLimit } from "./rate-limit";

export interface RequestMagicLinkInput {
  email: string;
  /** HMAC-отпечаток IP для rate limit и согласий. */
  ipHash?: string | null;
  now?: Date;
}

/**
 * Шаг 1 входа: создать одноразовый токен и "отправить" письмо.
 * В dev ссылка возвращается как devLink, чтобы не ходить в почту.
 */
export async function requestMagicLink(
  input: RequestMagicLinkInput,
): Promise<ActionResult<{ devLink?: string }>> {
  const parsedEmail = emailSchema.safeParse(input.email);
  if (!parsedEmail.success) {
    return actionFail(
      "VALIDATION",
      parsedEmail.error.issues[0]?.message ?? "Проверь адрес почты",
    );
  }

  if (
    input.ipHash &&
    !consumeRateLimit(
      `magic-link:${input.ipHash}`,
      RATE_LIMITS.magicLinkPerIp,
      (input.now ?? new Date()).getTime(),
    )
  ) {
    return actionFail(
      "RATE_LIMITED",
      "Слишком много попыток. Подожди минуту и попробуй снова.",
    );
  }

  const email = parsedEmail.data;
  const env = getEnv();
  const db = await getDb();
  const now = input.now ?? new Date();

  const token = randomToken();
  const tokenHash = sha256Hex(token);
  const expiresAt = new Date(now.getTime() + AUTH_TTL.magicLinkMinutes * 60_000);

  await deleteStaleAuthTokens(db, now);
  await createAuthToken(db, {
    id: uuidv7(),
    emailEnc: sealText(email),
    emailHmac: hashEmail(email),
    tokenHash,
    expiresAt,
  });

  const link = `${env.APP_URL.replace(/\/+$/, "")}/auth/verify?token=${encodeURIComponent(token)}`;
  await createMailer().sendMagicLink({ to: email, link, expiresAt });

  return actionOk({ devLink: env.showDevMagicLink ? link : undefined });
}

export interface VerifiedSession {
  user: CurrentUser;
  sessionToken: string;
  sessionExpiresAt: Date;
}

/**
 * Шаг 2 входа: проверить одноразовый токен из письма, создать пользователя
 * (если первый вход) и серверную сессию.
 */
export async function verifyMagicLink(
  rawToken: string,
  meta: { ipHash?: string | null; now?: Date } = {},
): Promise<ActionResult<VerifiedSession>> {
  const token = rawToken.trim();
  if (token.length < 20) {
    return actionFail(
      "AUTH_INVALID",
      "Ссылка для входа повреждена. Запроси новую.",
    );
  }

  const db = await getDb();
  const now = meta.now ?? new Date();
  const consumed = await consumeAuthToken(db, sha256Hex(token), now);
  if (!consumed) {
    return actionFail(
      "AUTH_INVALID",
      "Ссылка уже использована или истекла. Запроси новую.",
    );
  }

  const email = openText(consumed.emailEnc);
  const user = await findOrCreateUser(db, {
    id: uuidv7(),
    emailEnc: consumed.emailEnc,
    emailHmac: consumed.emailHmac,
  });

  const sessionToken = randomToken();
  const sessionExpiresAt = new Date(
    now.getTime() + AUTH_TTL.sessionDays * 24 * 60 * 60 * 1000,
  );

  await createSession(db, {
    id: uuidv7(),
    userId: user.id,
    tokenHash: sha256Hex(sessionToken),
    expiresAt: sessionExpiresAt,
    ipHash: meta.ipHash ?? null,
  });

  const completed = await hasCompletedOnboarding(db, user.id);
  return actionOk({
    user: toCurrentUser(user, completed, email),
    sessionToken,
    sessionExpiresAt,
  });
}

/** Возвращает текущего пользователя по токену сессии или null. */
export async function getSessionUser(
  sessionToken: string | null | undefined,
): Promise<CurrentUser | null> {
  if (!sessionToken) return null;

  const db = await getDb();
  const found = await findSessionUser(db, sha256Hex(sessionToken));
  if (!found) return null;

  const completed = await hasCompletedOnboarding(db, found.user.id);
  return toCurrentUser(found.user, completed);
}

/** Завершает сессию (revoke в БД + cookie удаляет веб-слой). */
export async function logout(
  sessionToken: string | null | undefined,
): Promise<void> {
  if (!sessionToken) return;
  const db = await getDb();
  await revokeSession(db, sha256Hex(sessionToken));
}

function toCurrentUser(
  row: UserRow,
  completedOnboarding: boolean,
  knownEmail?: string,
): CurrentUser {
  return {
    id: row.id,
    email: knownEmail ?? openText(row.emailEnc),
    status: row.status as UserStatus,
    ageConfirmed: row.ageConfirmed,
    hasCompletedOnboarding: completedOnboarding,
    createdAt: row.createdAt.toISOString(),
  };
}
