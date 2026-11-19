/**
 * Каркас воркера (apps/worker) — напоминания, отчёты, сверка платежей.
 * Phase 1: обработчики появятся вместе с доменами (T-101…T-105). Сейчас
 * процесс проверяет конфигурацию и остаётся пустым, чтобы не плодить
 * неиспользуемый код.
 */
const redisUrl = process.env.REDIS_URL;
const nodeEnv = process.env.NODE_ENV ?? "development";
const llmProvider = process.env.LLM_PROVIDER ?? "fake";

console.info(`[opora:worker] старт: env=${nodeEnv}, llm=${llmProvider}`);

if (!redisUrl) {
  console.info(
    "[opora:worker] REDIS_URL не задан: очередь не подключена (Phase 1). " +
      "Для локальной проверки очередей подними Redis из infra/docker-compose.yml.",
  );
} else {
  console.info(
    "[opora:worker] REDIS_URL задан. BullMQ-очереди подключаются в задачах T-101+.",
  );
}
