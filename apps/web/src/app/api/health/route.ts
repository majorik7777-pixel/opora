import { checkDatabaseHealth } from "@opora/core";

export const dynamic = "force-dynamic";

/** Healthcheck для Playwright webServer, деплоя и мониторинга. */
export async function GET(): Promise<Response> {
  const dbOk = await checkDatabaseHealth();

  return Response.json(
    {
      status: dbOk ? "ok" : "degraded",
      db: dbOk ? "ok" : "error",
      ts: new Date().toISOString(),
    },
    { status: dbOk ? 200 : 503 },
  );
}
