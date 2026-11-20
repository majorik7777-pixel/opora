import {
  CHAT_CONTEXT_MESSAGES,
  CHAT_MESSAGE_MAX_LENGTH,
  FREE_MESSAGES_PER_DAY,
  actionFail,
  actionOk,
  chatDayStart,
  chatSendSchema,
  getOnboardingLabel,
  type ActionResult,
  type ChatHistory,
  type ChatMessageView,
  type ChatStreamEvent,
  type OnboardingAnswers,
} from "@opora/shared";
import {
  countUserChatMessagesSince,
  ensureChatThread,
  findChatThread,
  getDb,
  insertChatMessage,
  listChatMessages,
  listRecentChatMessages,
} from "@opora/db";
import {
  CHAT_SYSTEM_PROMPT_V1,
  createLlmProvider,
  moderateText,
  type ChatMessage,
  type LlmProvider,
} from "@opora/llm";
import { getEnv, openText, sealText, uuidv7 } from "@opora/shared/server";

import { getOnboardingProfile } from "./onboarding";

/**
 * Чат «Опоры» (T-101, docs/specs/chat.md).
 *
 * Рамка продукта (D-002): чат — вспомогательный слой, а не «24/7 компаньон».
 * Поэтому сервер считает лимит по БД, вызывает safety-хук до генерации и
 * хранит переписку только в зашифрованном виде.
 */

/** Бюджет контекста: ~2 500 токенов, грубая оценка «4 символа ≈ 1 токен». */
export const CHAT_CONTEXT_CHAR_BUDGET = 10_000;

export interface SafetyVerdict {
  flagged: boolean;
  reason?: string;
}

/** Хук безопасности: вызывается до генерации. T-105 заменит заглушку. */
export type SafetyHook = (text: string) => SafetyVerdict | Promise<SafetyVerdict>;

export const localSafetyHook: SafetyHook = (text) => {
  const verdict = moderateText(text);
  return {
    flagged: verdict.flagged,
    reason: verdict.categories.join(", ") || undefined,
  };
};

export interface ChatDeps {
  provider?: LlmProvider;
  safety?: SafetyHook;
  /** Подмена времени в тестах (дневной лимит). */
  now?: () => Date;
}

function resolveProvider(deps: ChatDeps): LlmProvider {
  if (deps.provider) return deps.provider;

  const env = getEnv();
  return createLlmProvider(env.LLM_PROVIDER, {
    apiKey: env.LLM_API_KEY,
    baseUrl: env.LLM_BASE_URL,
    model: env.LLM_MODEL,
  });
}

function toView(row: {
  id: string;
  role: string;
  contentEnc: string;
  createdAt: Date;
}): ChatMessageView {
  return {
    id: row.id,
    role: row.role === "assistant" ? "assistant" : "user",
    content: openText(row.contentEnc),
    createdAt: row.createdAt.toISOString(),
  };
}

/** Сколько сообщений пользователя осталось на сегодня. */
export async function countRemainingMessages(
  userId: string,
  now: Date = new Date(),
): Promise<number> {
  const db = await getDb();
  const used = await countUserChatMessagesSince(db, userId, chatDayStart(now));
  return Math.max(0, FREE_MESSAGES_PER_DAY - used);
}

/** История чата для экрана `/app/chat`. */
export async function getChatHistory(
  userId: string,
  deps: ChatDeps = {},
): Promise<ActionResult<ChatHistory>> {
  const db = await getDb();
  const thread = await findChatThread(db, userId);
  const now = deps.now?.() ?? new Date();
  const used = await countUserChatMessagesSince(db, userId, chatDayStart(now));

  const messages = thread
    ? (await listChatMessages(db, thread.id)).map(toView)
    : [];

  return actionOk({
    messages,
    remaining: Math.max(0, FREE_MESSAGES_PER_DAY - used),
    limit: FREE_MESSAGES_PER_DAY,
  });
}

function onboardingContext(answers: OnboardingAnswers): string {
  const lines = [
    `Ситуация: ${getOnboardingLabel("situation", answers.situation)}`,
    `Сколько прошло: ${getOnboardingLabel("timing", answers.timing)}`,
    `Что тяжелее всего: ${getOnboardingLabel("pain", answers.pain)}`,
    `Цель: ${getOnboardingLabel("goal", answers.goal)}`,
    `Сон: ${getOnboardingLabel("sleep", answers.sleep)}`,
  ];
  return `Что известно об этой участнице (из онбординга):\n${lines.join("\n")}`;
}

/**
 * Контекст для LLM: системный промпт → онбординг → последние сообщения.
 * При переполнении бюджета старые сообщения отбрасываются, промпт и онбординг — нет.
 */
export async function buildChatContext(
  userId: string,
  threadId: string,
  options: { deps?: ChatDeps; charBudget?: number } = {},
): Promise<ChatMessage[]> {
  const db = await getDb();
  const budget = options.charBudget ?? CHAT_CONTEXT_CHAR_BUDGET;

  const context: ChatMessage[] = [];
  let size = CHAT_SYSTEM_PROMPT_V1.length;
  context.push({ role: "system", content: CHAT_SYSTEM_PROMPT_V1 });

  const profile = await getOnboardingProfile(userId);
  if (profile) {
    const summary = onboardingContext(profile.answers);
    if (size + summary.length <= budget) {
      context.push({ role: "system", content: summary });
      size += summary.length;
    }
  }

  const recent = await listRecentChatMessages(db, threadId, CHAT_CONTEXT_MESSAGES);
  const history: ChatMessage[] = [];
  for (let index = recent.length - 1; index >= 0; index -= 1) {
    const row = recent[index];
    if (!row) continue;
    const content = openText(row.contentEnc);
    if (size + content.length > budget && history.length > 0) break;
    history.unshift({ role: row.role === "assistant" ? "assistant" : "user", content });
    size += content.length;
  }

  return [...context, ...history];
}

export interface ChatTurn {
  /** ID сообщения пользователя, уже сохранённого в БД. */
  userMessageId: string;
  /** ID будущего ответа ассистента (создаётся при старте стрима). */
  assistantMessageId: string;
  remaining: number;
  events: AsyncIterable<ChatStreamEvent>;
}

/**
 * Отправка сообщения: валидация → лимит → safety → сохранение → стриминг.
 * Возвращает поток событий; сохранение ответа происходит в конце потока.
 */
export async function sendChatMessage(
  userId: string,
  input: unknown,
  deps: ChatDeps = {},
): Promise<ActionResult<ChatTurn>> {
  const parsed = chatSendSchema.safeParse(input);
  if (!parsed.success) {
    return actionFail(
      "VALIDATION",
      parsed.error.issues[0]?.message ?? `Не больше ${CHAT_MESSAGE_MAX_LENGTH} символов`,
    );
  }

  const db = await getDb();
  const now = deps.now?.() ?? new Date();
  const thread = await ensureChatThread(db, { id: uuidv7(), userId, now });

  const used = await countUserChatMessagesSince(db, userId, chatDayStart(now));
  if (used >= FREE_MESSAGES_PER_DAY) {
    return actionFail(
      "RATE_LIMITED",
      `На сегодня всё: ${FREE_MESSAGES_PER_DAY} сообщений в день. Лимит сбросится завтра.`,
    );
  }

  const text = parsed.data.text;
  const verdict = await (deps.safety ?? localSafetyHook)(text);

  const userMessageId = uuidv7();
  await insertChatMessage(db, {
    id: userMessageId,
    threadId: thread.id,
    userId,
    role: "user",
    contentEnc: sealText(text),
    safetyFlag: verdict.flagged ? "risk" : "ok",
    createdAt: now,
  });

  const remaining = Math.max(0, FREE_MESSAGES_PER_DAY - used - 1);
  const assistantMessageId = uuidv7();
  const provider = resolveProvider(deps);

  async function* events(): AsyncIterable<ChatStreamEvent> {
    yield { type: "start", messageId: assistantMessageId, remaining };

    if (verdict.flagged) {
      yield { type: "safety", reason: verdict.reason ?? "crisis" };
      yield { type: "done", messageId: assistantMessageId, remaining };
      return;
    }

    const context = await buildChatContext(userId, thread.id);
    let answer = "";

    try {
      for await (const chunk of provider.chat({ messages: context })) {
        if (!chunk.delta) continue;
        answer += chunk.delta;
        yield { type: "delta", delta: chunk.delta };
      }
    } catch {
      // Текст ошибки провайдера не содержит переписки, но и его не логируем.
      yield {
        type: "error",
        code: "INTERNAL",
        message: "Не удалось получить ответ. Попробуй ещё раз через минуту.",
      };
    }

    if (answer.trim()) {
      await insertChatMessage(db, {
        id: assistantMessageId,
        threadId: thread.id,
        userId,
        role: "assistant",
        contentEnc: sealText(answer.trim()),
        provider: provider.id,
        createdAt: new Date((deps.now?.() ?? new Date()).getTime() + 1),
      });
    }

    yield { type: "done", messageId: assistantMessageId, remaining };
  }

  return actionOk({
    userMessageId,
    assistantMessageId,
    remaining,
    events: events(),
  });
}
