"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  CHAT_MESSAGE_MAX_LENGTH,
  CRISIS_CONTACTS,
  CRISIS_CONTACTS_VERIFIED_AT,
  ROUTES,
  type ChatMessageView,
  type ChatStreamEvent,
} from "@opora/shared";
import { buttonStyles } from "@opora/ui";

interface ChatPanelProps {
  initialMessages: ChatMessageView[];
  initialRemaining: number;
  limit: number;
}

const QUICK_ACTIONS = [
  { label: "Мне плохо сейчас", text: "Мне сейчас очень плохо. Не знаю, за что зацепиться." },
  { label: "Не могу перестать думать о нём", text: "Не могу перестать думать о нём — мысли по кругу с утра." },
  { label: "Не хочу ничего делать", text: "Ничего не хочется делать. Просто лежу и смотрю в стену." },
] as const;

function timeLabel(iso: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** Экран чата: история, стриминг ответа, лимит и кризисный блок. */
export function ChatPanel({ initialMessages, initialRemaining, limit }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessageView[]>(initialMessages);
  const [remaining, setRemaining] = useState(initialRemaining);
  const [text, setText] = useState("");
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crisis, setCrisis] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, draft]);

  async function send(rawText: string) {
    const value = rawText.trim();
    if (!value || pending) return;
    if (remaining <= 0) {
      setError("На сегодня лимит сообщений закончился. Возвращайся завтра — или открой программу дня.");
      return;
    }

    setError(null);
    setCrisis(false);
    setPending(true);
    setText("");
    const userMessage: ChatMessageView = {
      id: `local-${Date.now()}`,
      role: "user",
      content: value,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setDraft("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as {
          code?: string;
          message?: string;
        };
        setMessages((prev) => prev.filter((item) => item.id !== userMessage.id));
        setText(value);
        setError(payload.message ?? "Не удалось отправить сообщение. Попробуй ещё раз.");
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setError("Браузер не поддерживает потоковый ответ. Обнови страницу.");
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let answer = "";
      let assistantId = `assistant-${Date.now()}`;

      while (true) {
        const { value: chunk, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(chunk, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          let event: ChatStreamEvent;
          try {
            event = JSON.parse(line.slice(5).trim()) as ChatStreamEvent;
          } catch {
            continue;
          }

          if (event.type === "start") {
            assistantId = event.messageId;
            setRemaining(event.remaining);
          } else if (event.type === "delta") {
            answer += event.delta;
            setDraft(answer);
          } else if (event.type === "safety") {
            setCrisis(true);
            setDraft("");
          } else if (event.type === "error") {
            setError(event.message);
          } else if (event.type === "done") {
            // Важно: считаем текст ДО setMessages — updater выполняется позже,
            // когда answer уже сброшен.
            const finalText = answer.trim();
            const finalId = assistantId;
            const createdAt = new Date().toISOString();
            setRemaining(event.remaining);
            if (finalText) {
              setMessages((prev) => [
                ...prev,
                { id: finalId, role: "assistant", content: finalText, createdAt },
              ]);
            }
            setDraft("");
            answer = "";
          }
        }
      }
    } catch {
      setError("Связь прервалась. Проверь интернет и попробуй ещё раз.");
    } finally {
      setPending(false);
    }
  }

  const outOfLimit = remaining <= 0;

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 rounded-full bg-sage-soft px-3.5 py-1.5 text-[13px] font-medium text-sage-deep">
          Осталось {remaining} из {limit} сообщений сегодня
        </p>
        <p className="text-xs text-muted">Лимит считаем по московскому времени</p>
      </div>

      <div
        ref={listRef}
        className="mt-4 max-h-[52vh] min-h-[280px] overflow-y-auto rounded-card bg-surface p-4 shadow-soft sm:p-5"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {messages.length === 0 && !draft ? (
          <div className="py-6">
            <p className="text-base font-semibold">Здесь можно говорить как есть.</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted">
              Без осуждения и оценок. Опора ответит и поможет сделать один
              маленький шаг. Если совсем тяжело — начни с кнопки ниже.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {messages.map((message) => (
              <li
                key={message.id}
                className={
                  message.role === "user"
                    ? "ml-auto w-fit max-w-[85%] rounded-bubble rounded-br-md bg-ink px-4 py-2.5 text-white"
                    : "w-fit max-w-[88%] rounded-bubble rounded-bl-md bg-paper-read px-4 py-2.5 text-ink"
                }
              >
                <p className="whitespace-pre-wrap text-[15px] leading-6">{message.content}</p>
                <p
                  className={
                    message.role === "user"
                      ? "mt-1 text-[11px] text-white/60"
                      : "mt-1 text-[11px] text-muted"
                  }
                >
                  {message.role === "user" ? "Ты" : "Опора"} · {timeLabel(message.createdAt)}
                </p>
              </li>
            ))}
            {draft ? (
              <li className="w-fit max-w-[88%] rounded-bubble rounded-bl-md bg-paper-read px-4 py-2.5 text-ink">
                <p className="whitespace-pre-wrap text-[15px] leading-6">{draft}</p>
                <p className="mt-1 text-[11px] text-muted">Опора печатает…</p>
              </li>
            ) : null}
            {pending && !draft ? (
              <li className="w-fit rounded-bubble bg-paper-read px-4 py-3 text-sm text-muted">
                Опора печатает…
              </li>
            ) : null}
          </ul>
        )}
      </div>

      {crisis ? (
        <div role="alert" className="mt-4 rounded-card border border-danger/30 bg-accent-soft p-4">
          <p className="text-base font-semibold text-ink">Сейчас важнее другое</p>
          <p className="mt-1 text-sm leading-6 text-ink/80">
            Похоже, тебе очень тяжело. Пожалуйста, свяжись с человеком, который
            может быть рядом, и с одним из номеров ниже — это бесплатно и
            анонимно.
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {CRISIS_CONTACTS.map((contact) => (
              <li key={contact.phone}>
                <a href={`tel:${contact.tel}`} className="font-semibold underline underline-offset-2">
                  {contact.phone}
                </a>{" "}
                <span className="text-ink/70">
                  — {contact.label}, {contact.note.toLowerCase()}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">Проверено {CRISIS_CONTACTS_VERIFIED_AT}</p>
        </div>
      ) : null}

      {error ? (
        <div role="alert" className="mt-4 rounded-card border border-line bg-surface p-4 text-sm">
          <p className="text-ink">{error}</p>
          <button
            type="button"
            onClick={() => void send(text || "Мне нужно поговорить")}
            className="mt-2 min-h-9 font-semibold text-accent-strong underline underline-offset-2"
          >
            Попробовать ещё раз
          </button>
        </div>
      ) : null}

      <form
        className="mt-4"
        onSubmit={(event) => {
          event.preventDefault();
          void send(text);
        }}
      >
        <label htmlFor="chat-text" className="sr-only">
          Сообщение
        </label>
        <textarea
          id="chat-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          maxLength={CHAT_MESSAGE_MAX_LENGTH}
          rows={3}
          disabled={pending || outOfLimit}
          placeholder={
            outOfLimit
              ? "На сегодня лимит закончился — возвращайся завтра"
              : "Напиши, что происходит. Можно коротко."
          }
          className="w-full resize-none rounded-field border border-line bg-surface px-4 py-3 text-[15px] leading-6 text-ink placeholder:text-muted/70 disabled:bg-paper-read"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-xs text-muted">
            {text.length}/{CHAT_MESSAGE_MAX_LENGTH}
          </p>
          <button
            type="submit"
            disabled={pending || outOfLimit || text.trim().length === 0}
            className={buttonStyles({ variant: "signal", size: "md" })}
          >
            {pending ? "Отправляю…" : "Отправить"}
          </button>
        </div>
      </form>

      <div className="mt-5">
        <p className="text-xs uppercase tracking-[0.12em] text-muted">Быстрый старт</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              disabled={pending || outOfLimit}
              onClick={() => void send(action.text)}
              className="min-h-9 rounded-full border border-line bg-surface px-3.5 text-[13px] text-ink hover:border-ink/25 hover:bg-accent-soft/40 disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
          <Link
            href={ROUTES.appProgram}
            className="inline-flex min-h-9 items-center rounded-full border border-line bg-surface px-3.5 text-[13px] text-ink hover:border-ink/25 hover:bg-accent-soft/40"
          >
            Открыть день программы
          </Link>
        </div>
      </div>
    </div>
  );
}
