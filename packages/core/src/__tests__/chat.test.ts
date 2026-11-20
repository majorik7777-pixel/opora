import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  CHAT_LIMIT_TIMEZONE,
  FREE_MESSAGES_PER_DAY,
  chatDayKey,
  chatDayStart,
  type ChatStreamEvent,
} from "@opora/shared";
import {
  closeDb,
  ensureDatabaseReady,
  findChatThread,
  getDb,
  listChatMessages,
  users,
} from "@opora/db";
import { hashEmail, sealText, uuidv7 } from "@opora/shared/server";
import { CHAT_SYSTEM_PROMPT_V1, type ChatRequest, type LlmProvider } from "@opora/llm";
import {
  buildChatContext,
  countRemainingMessages,
  getChatHistory,
  sendChatMessage,
} from "../chat";
import { saveOnboarding } from "../onboarding";

let userCounter = 0;

async function createUser(): Promise<string> {
  userCounter += 1;
  const id = uuidv7();
  const email = `chat-${userCounter}-${Date.now()}@example.com`;
  const db = await getDb();
  await db.insert(users).values({
    id,
    emailEnc: sealText(email),
    emailHmac: hashEmail(email),
    ageConfirmed: true,
  });
  return id;
}

/** Провайдер-заглушка: запоминает запрос и отдаёт заданный текст кусками. */
function stubProvider(reply: string, captured: ChatRequest[] = []): LlmProvider {
  return {
    id: "stub",
    async *chat(request: ChatRequest) {
      captured.push(request);
      for (const word of reply.split(" ")) {
        yield { delta: `${word} ` };
      }
      yield { delta: "", done: true };
    },
    async embed(texts: string[]) {
      return texts.map(() => [0]);
    },
    async moderate() {
      return { flagged: false, categories: [] };
    },
  };
}

async function collect(events: AsyncIterable<ChatStreamEvent>): Promise<ChatStreamEvent[]> {
  const list: ChatStreamEvent[] = [];
  for await (const event of events) list.push(event);
  return list;
}

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.DATABASE_DRIVER = "pglite";
  process.env.PGLITE_DATA_DIR = ":memory:";
  process.env.APP_URL = "http://localhost:3100";
  process.env.AUTH_SECRET = "test-auth-secret-1234567890";
  process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
  process.env.AUTH_DEV_SHOW_LINK = "true";
  process.env.EMAIL_TRANSPORT = "console";
  process.env.LLM_PROVIDER = "fake";
  await ensureDatabaseReady();
});

afterAll(async () => {
  await closeDb();
});

describe("лимит по дням в Europe/Moscow", () => {
  it("считает день и начало дня по московскому времени", () => {
    // 20.11.2026 22:30 UTC = 21.11.2026 01:30 MSK
    const late = new Date("2026-11-20T22:30:00.000Z");
    expect(chatDayKey(late, CHAT_LIMIT_TIMEZONE)).toBe("2026-11-21");
    // Начало 21.11 MSK = 20.11 21:00 UTC
    expect(chatDayStart(late, CHAT_LIMIT_TIMEZONE).toISOString()).toBe(
      "2026-11-20T21:00:00.000Z",
    );

    const evening = new Date("2026-11-20T18:00:00.000Z"); // 21:00 MSK того же дня
    expect(chatDayKey(evening, CHAT_LIMIT_TIMEZONE)).toBe("2026-11-20");
  });
});

describe("чат: отправка, лимит, шифрование", () => {
  it("стримит ответ и сохраняет оба сообщения зашифрованными", async () => {
    const userId = await createUser();
    const reply = "Слышу тебя. Что сейчас тяжелее всего?";
    const captured: ChatRequest[] = [];

    const result = await sendChatMessage(
      userId,
      { text: "Мне очень плохо сегодня" },
      { provider: stubProvider(reply, captured) },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const events = await collect(result.data.events);
    expect(events[0]?.type).toBe("start");
    expect(events.some((event) => event.type === "delta")).toBe(true);
    expect(events.at(-1)?.type).toBe("done");

    const answer = events
      .filter((event): event is { type: "delta"; delta: string } => event.type === "delta")
      .map((event) => event.delta)
      .join("")
      .trim();
    expect(answer).toBe(reply);

    const db = await getDb();
    const thread = await findChatThread(db, userId);
    const rows = thread ? await listChatMessages(db, thread.id) : [];
    expect(rows).toHaveLength(2);
    const userRow = rows.find((row) => row.role === "user");
    const assistantRow = rows.find((row) => row.role === "assistant");
    expect(userRow?.contentEnc).not.toContain("плохо");
    expect(userRow?.safetyFlag).toBe("ok");
    expect(assistantRow?.provider).toBe("stub");

    // Контекст: системный промпт + сохранённое сообщение пользователя.
    const messages = captured[0]?.messages ?? [];
    expect(messages[0]?.content).toBe(CHAT_SYSTEM_PROMPT_V1);
    expect(messages.at(-1)?.content).toContain("плохо");
  });

  it("после 5 сообщений возвращает RATE_LIMITED и историю с нулём", async () => {
    const userId = await createUser();
    const now = new Date("2026-11-20T09:00:00.000Z");

    for (let index = 0; index < FREE_MESSAGES_PER_DAY; index += 1) {
      const result = await sendChatMessage(
        userId,
        { text: `Сообщение ${index + 1}` },
        { provider: stubProvider("Ответ."), now: () => now },
      );
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      await collect(result.data.events);
    }

    const sixth = await sendChatMessage(
      userId,
      { text: "Шестое" },
      { provider: stubProvider("Ответ."), now: () => now },
    );
    expect(sixth.ok).toBe(false);
    if (!sixth.ok) expect(sixth.code).toBe("RATE_LIMITED");

    expect(await countRemainingMessages(userId, now)).toBe(0);

    const history = await getChatHistory(userId, { now: () => now });
    expect(history.ok).toBe(true);
    if (history.ok) {
      expect(history.data.remaining).toBe(0);
      expect(history.data.limit).toBe(FREE_MESSAGES_PER_DAY);
      expect(history.data.messages).toHaveLength(FREE_MESSAGES_PER_DAY * 2);
    }

    // На следующий день лимит снова доступен.
    const tomorrow = new Date("2026-11-21T09:00:00.000Z");
    expect(await countRemainingMessages(userId, tomorrow)).toBe(FREE_MESSAGES_PER_DAY);
  });

  it("валидирует пустое и слишком длинное сообщение", async () => {
    const userId = await createUser();
    const empty = await sendChatMessage(userId, { text: "   " }, { provider: stubProvider("x") });
    expect(empty.ok).toBe(false);
    if (!empty.ok) expect(empty.code).toBe("VALIDATION");

    const long = await sendChatMessage(
      userId,
      { text: "а".repeat(2001) },
      { provider: stubProvider("x") },
    );
    expect(long.ok).toBe(false);
  });
});

describe("безопасность и контекст", () => {
  it("при кризисе не запускает генерацию и сохраняет только сообщение пользователя", async () => {
    const userId = await createUser();
    const captured: ChatRequest[] = [];

    const result = await sendChatMessage(
      userId,
      { text: "Я не хочу жить дальше" },
      { provider: stubProvider("не должно выполниться", captured) },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const events = await collect(result.data.events);
    expect(events.some((event) => event.type === "safety")).toBe(true);
    expect(events.some((event) => event.type === "delta")).toBe(false);
    expect(captured).toHaveLength(0);

    const db = await getDb();
    const thread = await findChatThread(db, userId);
    const rows = thread ? await listChatMessages(db, thread.id) : [];
    expect(rows).toHaveLength(1);
    expect(rows[0]?.safetyFlag).toBe("risk");
  });

  it("кладёт онбординг в контекст", async () => {
    const userId = await createUser();
    await saveOnboarding(userId, {
      answers: {
        situation: "breakup",
        timing: "1_4_weeks",
        pain: "cant_let_go",
        goal: "stop_thinking",
        sleep: "hard_fall_asleep",
      },
      consents: { age: true, processing: true, special: true },
      acceptedAt: "2026-11-20T09:00:00.000Z",
    });

    const result = await sendChatMessage(
      userId,
      { text: "Не могу перестать думать о нём" },
      { provider: stubProvider("Понимаю.") },
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    await collect(result.data.events);

    const db = await getDb();
    const thread = await findChatThread(db, userId);
    expect(thread).not.toBeNull();
    const context = await buildChatContext(userId, thread?.id ?? "");
    const onboarding = context.find((message) => message.content.includes("онбординга"));
    expect(onboarding?.content).toContain("Расстались");
  });
});
