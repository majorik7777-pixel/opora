/** Коды ошибок API/серверных действий — единый формат для веба и будущего tRPC. */
export const ERROR_CODES = [
  "VALIDATION",
  "RATE_LIMITED",
  "AUTH_REQUIRED",
  "AUTH_INVALID",
  "TOKEN_EXPIRED",
  "NOT_FOUND",
  "CONFLICT",
  "INTERNAL",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: ErrorCode; message: string };

export function actionOk<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function actionFail(
  code: ErrorCode,
  message: string,
): ActionResult<never> {
  return { ok: false, code, message };
}
