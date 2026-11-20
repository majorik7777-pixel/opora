import type { Metadata } from "next";
import { getChatHistory } from "@opora/core";
import { Container, Disclaimer } from "@opora/ui";
import { ChatPanel } from "@/components/chat/chat-panel";
import { requireOnboardedUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Чат",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const user = await requireOnboardedUser();
  const history = await getChatHistory(user.id);

  const messages = history.ok ? history.data.messages : [];
  const remaining = history.ok ? history.data.remaining : 0;
  const limit = history.ok ? history.data.limit : 0;

  return (
    <Container size="narrow" className="py-8 sm:py-10">
      <p className="text-sm text-muted">Поддержка</p>
      <h1 className="mt-1 text-3xl leading-tight sm:text-4xl">Поговорить с Опорой</h1>
      <p className="mt-3 max-w-lg text-base leading-7 text-muted">
        Здесь можно написать в любой момент — без осуждения и оценок. Опора
        ответит коротко и предложит один маленький шаг.
      </p>

      <div className="mt-6">
        <ChatPanel
          initialMessages={messages}
          initialRemaining={remaining}
          limit={limit}
        />
      </div>

      <div className="mt-8 space-y-2">
        <Disclaimer>
          Опора — AI-собеседник, а не специалист. Она не ставит диагнозы и не
          назначает лечение. Если нужен человек — подскажем, куда обратиться.
        </Disclaimer>
        <Disclaimer>
          Если есть риск для жизни — позвони 112. Это важнее любого разговора.
        </Disclaimer>
      </div>
    </Container>
  );
}
