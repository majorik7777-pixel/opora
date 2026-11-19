/**
 * In-memory rate limit для Phase 1 (12-tech-plan.md §11).
 * Ограничение: работает в пределах одного процесса. При горизонтальном
 * масштабировании переезжает в Redis (задача с worker/инфраструктурой).
 */
interface Bucket {
  count: number;
  resetAt: number;
}

interface RateLimitRule {
  limit: number;
  windowMs: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5_000;

function sweep(now: number): void {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/** Возвращает true, если запрос разрешён, иначе false. */
export function consumeRateLimit(
  key: string,
  rule: RateLimitRule,
  now: number = Date.now(),
): boolean {
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    sweep(now);
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs });
    return true;
  }

  if (current.count >= rule.limit) return false;

  current.count += 1;
  return true;
}

/** Сбрасывает лимиты — используется в тестах. */
export function resetRateLimits(): void {
  buckets.clear();
}
