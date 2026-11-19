import Link from "next/link";
import { PROGRAM_PRICE_RUB, ROUTES } from "@opora/shared";
import { buttonStyles, Container } from "@opora/ui";

const included = [
  { title: "7 уроков", text: "по 5–7 минут, без «домашки» на три часа" },
  { title: "7 практик", text: "дыхание, дневник мыслей, ритуал завершения" },
  { title: "Дневник и AI-собеседник", text: "поддержка в любой момент, без осуждения" },
  { title: "Финальный отчёт", text: "что изменилось и план на 30 дней" },
  { title: "Доступ навсегда", text: "возвращайся к материалам, когда нужно" },
] as const;

export function PricingSection() {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="py-16 sm:py-20 lg:py-24">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <h2
            id="pricing-title"
            className="text-[32px] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[44px]"
          >
            Одна цена. Без подписок и скрытых списаний.
          </h2>

          <p className="mt-8 text-[56px] font-medium leading-none tracking-[-0.04em] sm:text-[72px]">
            {PROGRAM_PRICE_RUB} ₽
          </p>
          <p className="mt-3 text-base text-muted">
            за всю программу, доступ навсегда
          </p>

          <div className="mt-8">
            <Link
              href={ROUTES.onboarding}
              className={buttonStyles({ variant: "signal", size: "lg" })}
            >
              Попробовать бесплатно
            </Link>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">
            Первый день — бесплатно. Карта не нужна. Оплата — после того, как
            поймёшь, что формат подходит.
          </p>
        </div>

        <div className="lg:col-span-7">
          <p className="text-sm text-muted">Что входит</p>
          <ul className="mt-4 border-b border-line">
            {included.map((item) => (
              <li
                key={item.title}
                className="grid gap-1 border-t border-line py-4 sm:grid-cols-12 sm:items-baseline sm:gap-6"
              >
                <h3 className="text-base font-medium sm:col-span-5">{item.title}</h3>
                <p className="text-sm leading-6 text-muted sm:col-span-7">
                  {item.text}
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-sm leading-6 text-muted">
            Оплата через ЮKassa. Чек приходит на почту. Условия возврата — в{" "}
            <Link href={ROUTES.legal.offer} className="text-accent-deep underline underline-offset-2">
              оферте
            </Link>
            .
          </p>
        </div>
      </Container>
    </section>
  );
}

const faq = [
  {
    question: "Это заменит психолога?",
    answer:
      "Нет. Это программа самопомощи: уроки, практики и дневник. Сервис не ставит диагнозы, не назначает лечение и не заменяет работу со специалистом. Если нужна помощь врача или психотерапевта, мы подскажем, куда обратиться.",
  },
  {
    question: "Мне подойдёт, если мне 25 или 45?",
    answer:
      "Программа рассчитана на взрослых женщин 25–45 лет. Если тебе 18–24 или больше 45 — формат может подойти, но примеры в уроках ориентированы на этот возраст. При сомнениях начни с бесплатного дня.",
  },
  {
    question: "Насколько это анонимно?",
    answer:
      "Для входа нужна только почта, имя указывать не обязательно. Переписка и записи дневника шифруются, доступ к ним не передаётся рекламодателям. Данные можно удалить в настройках.",
  },
  {
    question: "Что будет, если я пропущу день?",
    answer:
      "Ничего страшного. Программа не сгорает и не сбрасывается: можно продолжить с того места, где остановилась, или начать заново. Без напоминаний «ты всё испортила».",
  },
  {
    question: "Чем это отличается от разговора с подругой?",
    answer:
      "Подруга может устать, осудить или дать совет, который не подходит. Здесь — структура: семь дней, понятные шаги, дневник и AI-собеседник, который не устаёт и не пересказывает твоё другим.",
  },
  {
    question: "Можно ли вернуть деньги?",
    answer:
      "Да, если программа не открыта или не пройдена — в течение 7 дней. Условия возврата описаны в оферте. Если что-то не работает, напиши — разберёмся без споров.",
  },
  {
    question: "Что делать, если сейчас совсем плохо?",
    answer:
      "Позвони 112, если есть угроза жизни. Если нужна именно психологическая поддержка — 8 (495) 989-50-50 (МЧС России, круглосуточно) или 8 800 250-18-59 (Российский Красный Крест). Приложение рядом, но оно не заменяет экстренную помощь.",
  },
] as const;

export function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="border-t border-line py-16 sm:py-20">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <h2
            id="faq-title"
            className="text-[32px] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[44px]"
          >
            Частые вопросы
          </h2>
          <p className="mt-5 max-w-sm text-base leading-7 text-muted">
            Не нашла ответ? Напиши — ответим без шаблонов.
          </p>
        </div>

        <div className="lg:col-span-8">
          {faq.map((item) => (
            <details key={item.question} className="group border-t border-line py-5 last:border-b">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium [&::-webkit-details-marker]:hidden">
                {item.question}
                <span aria-hidden className="text-2xl font-normal leading-none text-wine transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
