import type { ReactNode } from "react";
import { Card, Container } from "@opora/ui";

/* ---------- Line-иконки 24×24, толщина 1.5, без заливок ---------- */

function LessonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <path d="M12 6.4C10.5 5.2 8.4 4.6 5.7 4.6v13.2c2.7 0 4.8.6 6.3 1.8 1.5-1.2 3.6-1.8 6.3-1.8V4.6c-2.7 0-4.8.6-6.3 1.8Z" />
      <path d="M12 6.4v13.2" />
    </svg>
  );
}

function PracticeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <circle cx="12" cy="12" r="8.2" />
      <path d="M8.2 12.6c1.1-2.1 2.4-3.2 3.8-3.2s2.7 1.1 3.8 3.2c-1.1 2.1-2.4 3.2-3.8 3.2s-2.7-1.1-3.8-3.2Z" />
    </svg>
  );
}

function DiaryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <path d="M7.2 4.5h8.3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H7.2" />
      <path d="M7.2 4.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2" />
      <path d="M9.6 8.6h5.6M9.6 12h5.6M9.6 15.4h3.4" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <path d="M20 11.8c0 3.6-3.6 6.5-8 6.5-1 0-2-.2-2.9-.5L5 20l1.2-3.2A6.6 6.6 0 0 1 4 11.8C4 8.2 7.6 5.3 12 5.3s8 2.9 8 6.5Z" />
      <path d="M9 11.8h.01M12 11.8h.01M15 11.8h.01" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-6">
      <path d="M7.5 4.5h6L17 8v11.5a1 1 0 0 1-1 1H7.5a1 1 0 0 1-1-1V5.5a1 1 0 0 1 1-1Z" />
      <path d="M13.5 4.5V8H17" />
      <path d="M9.5 16.5v-3M12 16.5v-5M14.5 16.5v-2" />
    </svg>
  );
}

interface InsideItem {
  title: string;
  text: string;
  icon: ReactNode;
}

/** Пять составляющих программы из 11-copy.md §1.4. */
const insideItems: readonly InsideItem[] = [
  {
    title: "Урок дня",
    text: "Короткий, по делу: почему больно, что делать с мыслями, как не писать ему.",
    icon: <LessonIcon />,
  },
  {
    title: "Практика",
    text: "5 минут: дыхание, дневник мыслей, ритуал завершения.",
    icon: <PracticeIcon />,
  },
  {
    title: "Дневник",
    text: "Пиши текстом или голосом — AI бережно разберёт, что с тобой происходит.",
    icon: <DiaryIcon />,
  },
  {
    title: "Поддержка",
    text: "Можно написать в любой момент: тебя выслушают и помогут сделать шаг.",
    icon: <SupportIcon />,
  },
  {
    title: "Отчёт",
    text: "В конце — что изменилось и план на 30 дней.",
    icon: <ReportIcon />,
  },
];

/** «Что внутри» — карточки о содержании программы, а не о «100 уроках». */
export function InsideSection() {
  return (
    <section
      id="inside"
      aria-labelledby="inside-title"
      className="scroll-mt-20 py-14 sm:py-20"
    >
      <Container>
        <h2
          id="inside-title"
          className="max-w-3xl font-display text-[1.75rem] leading-[1.25] text-ink sm:text-4xl sm:leading-[1.2]"
        >
          Внутри — не курс из 100 уроков, а 7 дней по 10 минут.
        </h2>

        <ul className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
          {insideItems.map((item) => (
            <li key={item.title} className="h-full">
              <Card className="h-full">
                <span
                  aria-hidden="true"
                  className="flex size-12 items-center justify-center rounded-2xl bg-sage-soft text-sage-deep"
                >
                  {item.icon}
                </span>
                <h3 className="mt-4 text-lg font-medium leading-7 text-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/** Три шага входа из 11-copy.md §1.5 — крупные номера, спокойный ритм. */
const howSteps = [
  "Отвечаешь на 5 вопросов — это займёт 2 минуты.",
  "Проходишь первый день бесплатно.",
  "Продолжаешь за 990 ₽ — 7 дней, доступ навсегда.",
] as const;

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-title"
      className="scroll-mt-20 border-t border-line py-14 sm:py-20"
    >
      <Container>
        <h2
          id="how-it-works-title"
          className="font-display text-[1.75rem] leading-[1.25] text-ink sm:text-4xl sm:leading-[1.2]"
        >
          Как это работает
        </h2>

        <ol className="mt-8 grid gap-8 sm:mt-10 sm:grid-cols-3 sm:gap-6">
          {howSteps.map((step, index) => (
            <li key={step} className="border-t border-line pt-5">
              <span
                aria-hidden="true"
                className="font-display text-3xl leading-none text-sage-deep sm:text-4xl"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-3 text-base leading-7 text-ink sm:text-lg sm:leading-8">
                {step}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
