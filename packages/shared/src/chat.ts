import { z } from "zod";

/**
 * Контракт чата (T-101, docs/specs/chat.md).
 * Один источник правды для API, домена и UI: роли, лимиты, ошибки, формы.
 */

export const CHAT_ROLES = ["user", "assistant"] as const;
export type ChatRole = (typeof CHAT_ROLES)[number];

/** Максимальная длина одного сообщения — защита от «простыни» и от бюджета токенов. */
export const CHAT_MESSAGE_MAX_LENGTH = 2000;

/** Сколько последних сообщений попадает в контекст LLM (12-tech-plan §6.2). */
export const CHAT_CONTEXT_MESSAGES = 8;

/** Часовой пояс расчёта дневного лимита (Phase 1 — фиксированный, T-101 §Вопросы). */
export const CHAT_LIMIT_TIMEZONE = "Europe/Moscow";

export const chatSendSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Сообщение не может быть пустым")
    .max(CHAT_MESSAGE_MAX_LENGTH, `Не больше ${CHAT_MESSAGE_MAX_LENGTH} символов`),
});

export type ChatSendInput = z.infer<typeof chatSendSchema>;

/** Сообщение в том виде, в котором его отдаём в UI (расшифрованное). */
export interface ChatMessageView {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
}

export interface ChatHistory {
  messages: ChatMessageView[];
  /** Сколько сообщений пользователя осталось на сегодня. */
  remaining: number;
  limit: number;
}

/** События SSE-стрима ответа. */
export type ChatStreamEvent =
  | { type: "start"; messageId: string; remaining: number }
  | { type: "delta"; delta: string }
  | { type: "done"; messageId: string; remaining: number }
  | { type: "error"; code: string; message: string }
  | { type: "safety"; reason: string };

/**
 * Ключ дня для лимита в заданной таймзоне (YYYY-MM-DD).
 * Отдельная функция, чтобы тесты могли подменять «сейчас».
 */
export function chatDayKey(now: Date, timeZone: string = CHAT_LIMIT_TIMEZONE): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string): string =>
    parts.find((part) => part.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/** Начало календарного дня в таймзоне лимита — от него считаем сообщения. */
export function chatDayStart(now: Date, timeZone: string = CHAT_LIMIT_TIMEZONE): Date {
  const key = chatDayKey(now, timeZone);
  const offset = timeZoneOffsetMinutes(now, timeZone);
  const utcMidnight = Date.parse(`${key}T00:00:00.000Z`);
  return new Date(utcMidnight - offset * 60_000);
}

/** Смещение таймзоны в минутах для конкретного момента (учитывает летнее время). */
function timeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = dtf.formatToParts(date);
  const get = (type: string): number =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second"),
  );
  return (asUtc - date.getTime()) / 60_000;
}
