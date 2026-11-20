import Link from "next/link";
import { ROUTES } from "@opora/shared";
import { buttonStyles, Container } from "@opora/ui";

import type { Program } from "@/content/programs/types";

/** Заголовок с «событием»: *слово* → Literata italic. */
function Headline({ text }: { text: string }) {
  const parts = text.split("*");
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <em key={index} className="event-serif whitespace-nowrap font-normal">
            {part}
          </em>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

/** Экран продукта — главный герой первого экрана. */
function AppPreview({ program }: { program: Program }) {
  const { chat, day } = program.preview;

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface shadow-lift">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-success" />
          Опора · сегодня
        </p>
        <p className="text-xs text-muted">{day.label}</p>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-sage-soft px-4 py-3">
          <p className="text-sm font-medium text-sage-deep">Как настроение сейчас?</p>
          <div className="flex gap-1" aria-hidden="true">
            {Array.from({ length: 10 }, (_, index) => (
              <span
                key={index}
                className={
                  index < 4
                    ? "h-2 w-2 rounded-[4px] bg-accent"
                    : "h-2 w-2 rounded-[4px] bg-white"
                }
              />
            ))}
          </div>
        </div>

        <ul className="mt-4 space-y-2 text-sm leading-6">
          {chat.messages.map((message, index) => (
            <li
              key={index}
              className={
                message.role === "user"
                  ? "ml-auto w-fit max-w-[85%] rounded-bubble rounded-br-md bg-ink px-4 py-2.5 text-white"
                  : "w-fit max-w-[88%] rounded-bubble rounded-bl-md bg-paper-read px-4 py-2.5 text-ink"
              }
            >
              {message.text}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line p-4">
          <span
            aria-hidden="true"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-sm font-semibold text-accent-strong"
          >
            3
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold leading-snug">{day.title}</p>
            <p className="mt-0.5 text-xs text-muted">{day.minutes} · урок и практика</p>
          </div>
          <span className="ml-auto shrink-0 text-sm font-semibold text-accent-strong">
            {day.cta}
          </span>
        </div>

        <p className="mt-3 text-xs text-muted">{chat.caption}</p>
      </div>
    </div>
  );
}

export function Hero({ program }: { program: Program }) {
  return (
    <section className="bg-paper">
      <Container className="grid items-center gap-10 pb-12 pt-8 sm:pb-16 sm:pt-12 lg:grid-cols-12 lg:gap-14 lg:pb-20">
        <div className="lg:col-span-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-sage-soft px-3.5 py-1.5 text-[13px] font-medium text-sage-deep">
            7 дней · по 10 минут · 18+
          </p>

          <h1 className="mt-5 text-[38px] leading-[1.04] tracking-[-0.035em] sm:text-[48px] lg:text-[52px] lg:leading-[1.06]">
            <Headline text={program.headline} />
          </h1>

          <p className="mt-5 max-w-lg text-lg leading-8 text-muted">
            {program.subhead}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={ROUTES.onboarding}
              className={buttonStyles({ variant: "signal", size: "lg" })}
            >
              Начать первый день
            </Link>
            <a
              href="#inside"
              className="inline-flex min-h-11 items-center px-1 text-base text-ink underline decoration-ink/25 underline-offset-4 hover:decoration-ink"
            >
              Что внутри
            </a>
          </div>

          <p className="mt-4 text-sm text-muted">{program.heroNote}</p>

          <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-4">
            <div>
              <dt className="text-xl font-semibold tracking-[-0.02em]">10 мин</dt>
              <dd className="mt-1 text-[13px] leading-5 text-muted">в день, утром или вечером</dd>
            </div>
            {program.heroStats.map((item) => (
              <div key={item.value}>
                <dt className="text-xl font-semibold tracking-[-0.02em]">{item.value}</dt>
                <dd className="mt-1 text-[13px] leading-5 text-muted">{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-6">
          <AppPreview program={program} />
        </div>
      </Container>
    </section>
  );
}
