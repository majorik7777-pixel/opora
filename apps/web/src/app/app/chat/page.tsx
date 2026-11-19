import type { Metadata } from "next";
import { createLlmProvider, CHAT_SYSTEM_PROMPT_V1 } from "@opora/llm";
import { getEnv } from "@opora/shared/server";
import { FREE_MESSAGES_PER_DAY } from "@opora/shared";
import { Button, Card, Container, Disclaimer } from "@opora/ui";

export const metadata: Metadata = {
  title: "Чат",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Каркас чата: подтверждает, что адаптер LLM работает, без отправки сообщений. */
async function getIntroMessage(): Promise<string> {
  const provider = createLlmProvider(getEnv().LLM_PROVIDER);
  const chunks: string[] = [];
  for await (const chunk of provider.chat({
    messages: [
      { role: "system", content: CHAT_SYSTEM_PROMPT_V1 },
      { role: "user", content: "Здравствуйте. Мне нужно выговориться." },
    ],
  })) {
    if (chunk.delta) chunks.push(chunk.delta);
  }
  return chunks.join("").trim();
}

export default async function ChatPage() {
  const intro = await getIntroMessage();

  return (
    <Container size="narrow" className="py-8 sm:py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-muted">
        Чат · каркас Phase 0–1
      </p>
      <h1 className="mt-1 font-display text-3xl leading-tight text-ink sm:text-4xl">
        Поговорить с Опорой
      </h1>
      <p className="mt-3 text-base leading-7 text-muted">
        Здесь можно будет написать в любой момент. Лимит —{" "}
        {FREE_MESSAGES_PER_DAY} сообщений в день бесплатно, без осуждения и
        оценок.
      </p>

      <Card className="mt-6 space-y-4">
        <div className="max-w-[92%] rounded-bubble rounded-tl-md bg-bg p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Опора
          </p>
          <p className="mt-1 text-base leading-7 text-ink">{intro}</p>
        </div>

        <div className="rounded-field border border-dashed border-line bg-bg p-4 text-sm leading-6 text-muted">
          <p className="font-medium text-ink">Чат появится в следующем обновлении</p>
          <p className="mt-1">
            Адаптер LLM уже подключён (сейчас — тестовый провайдер). Дальше:
            стриминг ответов, лимит {FREE_MESSAGES_PER_DAY} сообщений в день и
            память контекста — задача T-101.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="chat-message" className="block text-sm font-medium text-ink">
            Сообщение
          </label>
          <textarea
            id="chat-message"
            disabled
            placeholder="Здесь появится поле ввода…"
            className="min-h-24 w-full rounded-field border border-line bg-bg px-4 py-3 text-base text-muted"
          />
          <Button type="button" disabled fullWidth>
            Отправить
          </Button>
        </div>
      </Card>

      <div className="mt-8 space-y-2">
        <Disclaimer>
          Опора — AI-собеседник, а не специалист. Она не ставит диагнозы и не
          назначает лечение.
        </Disclaimer>
        <Disclaimer>
          Если есть риск для жизни — позвони 112. Это важнее любого разговора.
        </Disclaimer>
      </div>
    </Container>
  );
}
