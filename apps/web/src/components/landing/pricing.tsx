import Link from "next/link";
import { ROUTES } from "@opora/shared";
import { buttonStyles, Container } from "@opora/ui";

import type { Program } from "@/content/programs/types";

export function PricingSection({ program }: { program: Program }) {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="border-t border-line py-14 sm:py-20">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <p className="text-sm text-muted">Стоимость</p>
          <h2
            id="pricing-title"
            className="mt-3 text-[30px] leading-[1.05] tracking-[-0.03em] sm:text-[40px]"
          >
            Одна цена. Без подписок и скрытых списаний.
          </h2>

          <p className="mt-7 text-[56px] leading-none tracking-[-0.04em] sm:text-[72px]">
            {program.pricing.price}
          </p>
          <p className="mt-3 text-base text-muted">{program.pricing.priceNote}</p>

          <div className="mt-7">
            <Link
              href={ROUTES.onboarding}
              className={buttonStyles({ variant: "signal", size: "lg" })}
            >
              Пройти первый день бесплатно
            </Link>
          </div>

          <p className="mt-4 rounded-card border border-line bg-surface px-4 py-3 text-sm leading-6 text-ink/80">
            <span className="font-medium text-ink">Возврат.</span>{" "}
            {program.pricing.guarantee}
          </p>

          <p className="mt-4 text-sm leading-6 text-muted">
            {program.pricing.paymentNote}{" "}
            <Link href={ROUTES.legal.offer} className="text-accent-deep underline underline-offset-2">
              Условия — в оферте
            </Link>
            .
          </p>
        </div>

        <div className="lg:col-span-7">
          <p className="text-sm text-muted">Что входит</p>
          <ul className="mt-4 border-b border-line">
            {program.pricing.includes.map((item) => (
              <li
                key={item.title}
                className="grid gap-1 border-t border-line py-4 sm:grid-cols-12 sm:items-baseline sm:gap-6"
              >
                <h3 className="text-base font-medium sm:col-span-5">{item.title}</h3>
                <p className="text-sm leading-6 text-muted sm:col-span-7">{item.text}</p>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-2 rounded-card border border-line bg-surface p-5">
            <p className="text-base font-medium">Что будет после оплаты</p>
            <p className="text-sm leading-6 text-muted">
              Откроется программа из семи дней, дневник и поддержка. Начнёшь с
              первого дня — можно сегодня, можно завтра. Доступ останется навсегда.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
