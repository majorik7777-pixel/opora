import { sendChatMessage } from "@opora/core";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/chat — отправка сообщения со стримингом (SSE).
 * Ответ: text/event-stream с событиями ChatStreamEvent (start/delta/done/error/safety).
 */
export async function POST(request: Request): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json(
      { code: "AUTH_REQUIRED", message: "Нужно войти в аккаунт" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { code: "VALIDATION", message: "Некорректный запрос" },
      { status: 400 },
    );
  }

  const result = await sendChatMessage(user.id, body);
  if (!result.ok) {
    const status = result.code === "RATE_LIMITED" ? 429 : 400;
    return Response.json(
      { code: result.code, message: result.message },
      { status },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of result.data.events) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
          );
        }
      } catch {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              code: "INTERNAL",
              message: "Связь прервалась. Попробуй отправить ещё раз.",
            })}\n\n`,
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
