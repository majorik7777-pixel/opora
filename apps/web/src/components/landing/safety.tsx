import type { ReactNode } from "react";
import Link from "next/link";
import { ROUTES } from "@opora/shared";
import { Container } from "@opora/ui";

/* ---------- Line-иконки 24×24, толщина 1.5, без заливок ---------- */

function AnonymousIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <path d="M10.6 5.3c.5-.1.9-.1 1.4-.1 4.5 0 8 4 8 6.8 0 1.3-.5 2.5-1.4 3.6" />
      <path d="M6.3 6.6C4.9 7.8 4 9.6 4 12c0 2.8 3.5 6.8 8 6.8 1.8 0 3.4-.6 4.7-1.5" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="m3.5 3.5 17 17" />
    </svg>
  );
}

function DataIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <rect x="4.5" y="4" width="15" height="6.5" rx="1.5" />
      <rect x="4.5" y="13.5" width="15" height="6.5" rx="1.5" />
      <path d="M8 7.25h.01M8 16.75h.01" />
    </svg>
  );
}

function NotMedicineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <path d="M12 4.2 5.3 6.8v4.9c0 3.7 2.8 7 6.7 7.6 3.9-.6 6.7-3.9 6.7-7.6V6.8L12 4.2Z" />
      <path d="m9.1 12 2 2 3.8-4.2" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <path d="M4.5 7h15" />
      <path d="M9.5 7V5.2c0-.4.3-.7.7-.7h3.6c.4 0 .7.3.7.7V7" />
      <path d="m6.5 7 .8 12c0 .6.4 1 1 1h7.4c.6 0 1-.4 1-1l.8-12" />
      <path d="M10.2 11v5M13.8 11v5" />
    </svg>
  );
}

function AdultIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-5">
      <circle cx="12" cy="8.4" r="3.2" />
      <path d="M5.8 19.8c.6-3.2 3-5.4 6.2-5.4s5.6 2.2 6.2 5.4" />
    </svg>
  );
}

interface SafetyPoint {
  lead: string;
  rest: string;
  icon: ReactNode;
}

/** Пять пунктов 11-copy.md §1.6 — дословно, с аккуратной типографикой. */
const safetyPoints: readonly SafetyPoint[] = [
  {
    lead: "Анонимно",
    rest: ": можно не указывать имя.",
    icon: <AnonymousIcon />,
  },
  {
    lead: "Данные хранятся в России",
    rest: ", переписка не продаётся и не передаётся рекламодателям.",
    icon: <DataIcon />,
  },
  {
    lead: "Это не медицина",
    rest: ": сервис не ставит диагнозы и не назначает лечение.",
    icon: <NotMedicineIcon />,
  },
  {
    lead: "Можно удалить все данные",
    rest: " в один клик.",
    icon: <DeleteIcon />,
  },
  {
    lead: "18+",
    rest: ".",
    icon: <AdultIcon />,
  },
];

const legalLinks = [
  { href: ROUTES.legal.privacy, label: "Политика конфиденциальности" },
  { href: ROUTES.legal.consent, label: "Согласие на обработку данных" },
  { href: ROUTES.legal.terms, label: "Условия использования" },
  { href: ROUTES.legal.offer, label: "Оферта" },
] as const;

/**
 * «Твои переживания — только твои.» — шалфейная полоса доверия:
 * приватность, данные в России, «не медицина», удаление и 18+.
 */
export function SafetySection() {
  return (
    <section
      id="safety"
      aria-labelledby="safety-title"
      className="scroll-mt-20 border-y border-line bg-sage-soft py-14 sm:py-20"
    >
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-16">
        <div>
          <h2
            id="safety-title"
            className="max-w-md font-display text-[1.75rem] leading-[1.25] text-ink sm:text-4xl sm:leading-[1.2]"
          >
            Твои переживания — только твои.
          </h2>

          <nav
            aria-label="Юридические документы"
            className="mt-6 flex max-w-md flex-wrap gap-x-4 gap-y-1"
          >
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-11 items-center text-sm leading-6 text-accent-deep underline underline-offset-4 hover:text-accent-strong"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <ul className="space-y-5">
          {safetyPoints.map((point) => (
            <li key={point.lead} className="flex items-start gap-4">
              <span
                aria-hidden="true"
                className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-surface text-sage-deep ring-1 ring-line"
              >
                {point.icon}
              </span>
              <p className="text-base leading-7 text-ink">
                <strong className="font-medium">{point.lead}</strong>
                {point.rest}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
