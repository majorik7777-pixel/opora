/** Безопасный внутренний redirect: только относительные пути своего приложения. */
export function safeNextPath(
  value: string | null | undefined,
  fallback = "/app",
): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
