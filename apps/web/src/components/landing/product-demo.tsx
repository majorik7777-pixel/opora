import type { ReactNode } from "react";
import { Container, ProgressBar } from "@opora/ui";

import type { Program } from "@/content/programs/types";

function Frame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="flex h-full flex-col rounded-card border border-line bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      {children}
    </div>
  );
}

export function ProductDemo({ program }: { program: Program }) {
  const { chat, day, diary } = program.preview;

  return (
    <section
      id="look"
      aria-labelledby="look-title"
      className="border-t border-line bg-paper-read py-14 sm:py-20"
    >
      <Container>
        <div className="grid gap-5 lg:grid-cols-12 lg:items-end">
          <h2
            id="look-title"
            className="text-[30px] leading-[1.05] tracking-[-0.03em] sm:text-[40px] lg:col-span-7"
          >
            Это не «курс из ста уроков». Вот как выглядит день.
          </h2>
          <p className="max-w-md text-base leading-7 text-ink/75 lg:col-span-5">
            Открываешь утром или вечером — и делаешь один маленький шаг. Всё
            остальное подождёт.
          </p>
        </div>

        <div className="mt-9 grid gap-4 lg:grid-cols-3">
          <Frame label={chat.title}>
            <ul className="mt-3 flex-1 space-y-2 text-sm leading-6">
              {chat.messages.map((message, index) => (
                <li
                  key={index}
                  className={
                    message.role === "user"
                      ? "ml-auto max-w-[88%] rounded-bubble bg-moss-soft px-3 py-2"
                      : "max-w-[92%] rounded-bubble bg-paper px-3 py-2 text-ink/85"
                  }
                >
                  {message.text}
                </li>
              ))}
            </ul>
            <p className="mt-3 border-t border-line pt-2 text-xs text-muted">
              {chat.caption}
            </p>
          </Frame>

          <Frame label={day.label}>
            <h3 className="mt-3 text-xl leading-snug">{day.title}</h3>
            <p className="mt-2 text-sm text-muted">{day.minutes} · урок и практика</p>
            <div className="mt-5">
              <ProgressBar value={43} ariaLabel="Прогресс программы" />
            </div>
            <p className="mt-2 text-xs text-muted">День {day.progress}</p>
            <div className="mt-auto pt-5">
              <span className="inline-flex min-h-11 w-full items-center justify-center rounded-button bg-accent-strong px-4 text-sm font-medium text-paper">
                {day.cta}
              </span>
            </div>
          </Frame>

          <Frame label={diary.label}>
            <h3 className="mt-3 text-xl leading-snug">{diary.title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink/75">{diary.text}</p>
            <p className="mt-4 text-xs text-muted">{diary.mood}</p>
            <div className="mt-2 flex gap-1" aria-hidden="true">
              {Array.from({ length: 10 }, (_, index) => (
                <span
                  key={index}
                  className={
                    index < 4
                      ? "h-1.5 flex-1 rounded-full bg-moss"
                      : "h-1.5 flex-1 rounded-full bg-line"
                  }
                />
              ))}
            </div>
            <div className="mt-auto pt-5">
              <span className="inline-flex min-h-11 w-full items-center justify-center rounded-button border border-line bg-surface px-4 text-sm font-medium text-ink">
                {diary.cta}
              </span>
            </div>
          </Frame>
        </div>
      </Container>
    </section>
  );
}
