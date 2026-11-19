import Link from "next/link";
import { ROUTES } from "@opora/shared";
import { buttonStyles, Card, Container } from "@opora/ui";

/** Состав программы из 11-copy.md §1.7 — без «бонусов» и допродаж. */
const included = [
  "7 уроков",
  "7 практик",
  "Дневник",
  "Поддержка AI",
  "Финальный отчёт",
  "Доступ навсегда",
] as const;

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 size-4 shrink-0 text-sage-deep"
    >
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

/**
 * Цена: 990 ₽ за всю программу. Слева — состав, справа — бесплатный вход
 * и условия оплаты. Без искусственного дефицита и спешки.
 */
export function PricingSection() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      className="scroll-mt-20 py-14 sm:py-20"
    >
      <Container>
        <div className="mx-auto max-w-4xl">
          <Card padded={false} className="overflow-hidden">
            <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="p-6 sm:p-8 lg:p-10">
                <h2 id="pricing-title">
                  <span className="block font-display text-5xl leading-none text-ink sm:text-6xl">
                    {"990\u00A0₽"}
                  </span>{" "}
                  <span className="mt-3 block text-base leading-6 text-muted">
                    за всю программу
                  </span>
                </h2>

                <p className="mt-7 text-sm font-medium leading-6 text-ink">
                  Внутри:
                </p>
                <ul className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                  {included.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm leading-6 text-ink"
                    >
                      <CheckIcon />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col justify-center border-t border-line bg-accent-soft/40 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
                <Link
                  href={ROUTES.onboarding}
                  className={buttonStyles({ size: "lg", fullWidth: true })}
                >
                  Начать бесплатно
                </Link>
                <p className="mt-4 text-xs leading-5 text-muted">
                  Оплата картой или СБП. Чек приходит на почту. Возврат — по
                  условиям{" "}
                  <Link
                    href={ROUTES.legal.offer}
                    className="underline underline-offset-2 hover:text-ink"
                  >
                    оферты
                  </Link>
                  .
                </p>
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}

/** Шесть вопросов из 11-copy.md §1.8 — дословно. */
const faqItems = [
  {
    question: "Это заменит психолога?",
    answer:
      "Нет. Это программа самопомощи и поддержки. Если нужен специалист — сервис подскажет, куда обратиться.",
  },
  {
    question: "Это точно анонимно?",
    answer:
      "Да. Можно не указывать настоящее имя. Мы не передаём переписку третьим лицам, кроме технических подрядчиков, без которых сервис не работает, и только в объёме, необходимом для работы.",
  },
  {
    question: "Мне 45+. Мне подойдёт?",
    answer: "Да, если тема расставания или развода тебе близка. Темп и язык — взрослые.",
  },
  {
    question: "Что, если станет хуже?",
    answer:
      "В острых состояниях сервис остановит программу и предложит контакты экстренной помощи. Это не замена врачу.",
  },
  {
    question: "Почему 990 ₽, а не бесплатно?",
    answer:
      "Бесплатно можно пройти первый день. 990 ₽ — это стоимость программы, которая делается людьми и требует серверов и AI. Дешевле одной сессии у психолога в 3–4 раза.",
  },
  {
    question: "Можно вернуть деньги?",
    answer:
      "Да, по условиям оферты: если программа не открыта/не пройдена, в течение 7 дней.",
  },
] as const;

/**
 * FAQ на нативных <details>/<summary> — работает без JS,
 * доступно с клавиатуры и не прячет ответы от поисковиков.
 */
export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="scroll-mt-20 border-t border-line py-14 sm:py-20"
    >
      <Container size="prose">
        <h2
          id="faq-title"
          className="font-display text-[1.75rem] leading-[1.25] text-ink sm:text-4xl sm:leading-[1.2]"
        >
          Частые вопросы
        </h2>

        <div className="mt-8 space-y-3 sm:mt-10">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-card border border-line bg-surface shadow-soft open:shadow-lift"
            >
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                <h3 className="text-base font-medium leading-6 text-ink">
                  {item.question}
                </h3>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5 shrink-0 text-sage-deep transition-transform duration-200 group-open:rotate-180"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <div className="px-5 pb-5">
                <p className="text-sm leading-6 text-muted sm:text-base sm:leading-7">
                  {item.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
