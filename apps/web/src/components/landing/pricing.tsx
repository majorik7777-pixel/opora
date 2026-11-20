import Link from "next/link";
import { ROUTES } from "@opora/shared";
import { buttonStyles, Container } from "@opora/ui";

import type { Program } from "@/content/programs/types";

const PASSPORT = [
  { title: "Без имени", text: "Для входа достаточно почты. Имя указывать не нужно." },
  { title: "Хранение в РФ", text: "Серверы в России, переписка и дневник шифруются." },
  { title: "Удаление", text: "Данные можно выгрузить или удалить в настройках — без писем и уговоров." },
] as const;

/**
 * Блок цены и приватности на тёмном поле (T-403, D-045).
 *
 * Единственный тёмный блок на странице. Состав подан как смета: позиции с
 * точками-выносками и строкой «Итого» — это отвечает на копирайт «без скрытых
 * списаний» структурой, а не обещанием. Правая колонка — паспорт данных.
 */
export function PricingSection({ program }: { program: Program }) {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      className="bg-field text-field-text"
    >
      <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <p className="text-[12.5px] uppercase tracking-[0.12em] opacity-70">
            Стоимость программы
          </p>
          <h2
            id="pricing-title"
            className="mt-4 max-w-[17ch] text-[32px] font-semibold leading-[1.07] tracking-[-0.03em] sm:text-[44px]"
          >
            Одна цена.{" "}
            <em className="event-serif font-normal">Без подписок</em> и скрытых
            списаний.
          </h2>

          <dl className="mt-8 border-t border-field-line">
            {program.pricing.includes.map((item) => (
              <div
                key={item.title}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-field-line/50 py-3"
              >
                <dt className="text-[15px] font-medium">{item.title}</dt>
                <span aria-hidden="true" className="hidden h-px flex-1 self-center bg-field-line sm:block" />
                <dd className="m-0 text-[13.5px] leading-5 opacity-85">{item.text}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-col gap-3 border-b border-field-line pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[12.5px] uppercase tracking-[0.12em] opacity-70">Итого</p>
              <p className="mt-1 text-[56px] font-semibold leading-none tracking-[-0.045em] text-field-accent tabular-nums sm:text-[64px]">
                {program.pricing.price}
              </p>
            </div>
            <p className="max-w-[18ch] text-[13.5px] leading-5 opacity-85 sm:text-right">
              {program.pricing.priceNote}
            </p>
          </div>

          <p className="mt-5 max-w-[46ch] text-[13.5px] leading-6 opacity-85">
            990 ₽ один раз — против 3 500–7 000 ₽ за одну сессию психолога и ~1 700 ₽ за месяц
            подписки ИИ-ассистента (обзоры цен, 2026). Это другой формат: программа и практики,
            а не разговор со специалистом — если нужен специалист, подскажем, куда обратиться.
          </p>

          <div className="mt-6">
            <Link
              href={ROUTES.onboarding}
              className={buttonStyles({ variant: "signal", size: "lg" })}
              data-ym="cta_price"
            >
              Пройти первый день бесплатно
            </Link>
          </div>

          <p className="mt-3 text-[13px] leading-5 opacity-70">
            Первый день — бесплатно, потом {program.pricing.price} один раз.
            Карта не нужна.{" "}
            <Link
              href={ROUTES.legal.offer}
              className="underline underline-offset-2 hover:opacity-100"
            >
              Условия в оферте
            </Link>
            .
          </p>
        </div>

        <div className="lg:col-span-5">
          <dl className="border-t border-field-line">
            {PASSPORT.map((item) => (
              <div key={item.title} className="border-b border-field-line/50 py-4">
                <dt className="text-[12.5px] uppercase tracking-[0.06em] opacity-70">
                  {item.title}
                </dt>
                <dd className="m-0 mt-1 text-[14px] leading-6 opacity-90">{item.text}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-5 max-w-[34ch] text-[13.5px] leading-6 opacity-85">
            {program.pricing.guarantee} {program.pricing.paymentNote}
          </p>
        </div>
      </Container>
    </section>
  );
}
