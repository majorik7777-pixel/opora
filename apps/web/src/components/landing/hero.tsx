import Link from "next/link";
import { ROUTES } from "@opora/shared";
import { buttonStyles, Container } from "@opora/ui";

import { HeroIllustration } from "./landing-illustration";

/**
 * Первый экран (11-copy.md §1.1): H1, подзаголовок, бесплатный вход
 * и микро-строка про разговор. Справа — абстрактная иллюстрация.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="overflow-hidden">
      <Container className="grid gap-10 pb-14 pt-10 sm:gap-12 sm:pb-18 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,29rem)] lg:items-center lg:gap-16 lg:pb-24 lg:pt-20">
        <div className="max-w-xl">
          <h1
            id="hero-title"
            className="font-display text-[2rem] leading-[1.15] text-ink sm:text-[3rem] sm:leading-[1.1] lg:text-[3.5rem] lg:leading-[1.06]"
          >
            {"7 дней, чтобы вернуть опору после расставания"}
          </h1>

          <p className="mt-5 text-lg leading-8 text-muted sm:mt-6 sm:text-xl sm:leading-9">
            Дневник, поддержка и маленькие шаги. Без осуждения. Анонимно.
          </p>

          <div className="mt-8 sm:mt-10">
            <Link
              href={ROUTES.onboarding}
              className={buttonStyles({
                size: "lg",
                className: "w-full sm:w-auto",
              })}
            >
              Начать бесплатно
            </Link>
            <p className="mt-3 text-sm leading-6 text-muted">
              Первый день — бесплатно. Карта не нужна.
            </p>
          </div>

          <p className="mt-8 max-w-md border-t border-line pt-6 text-sm leading-6 text-muted sm:mt-10">
            Если сейчас очень тяжело —{" "}
            <Link
              href={ROUTES.onboarding}
              className="font-medium text-accent-deep underline underline-offset-4 hover:text-accent-strong"
            >
              начни с бесплатного разговора
            </Link>
            . Это займёт минуту.
          </p>
        </div>

        <div className="mx-auto w-full max-w-[26rem] sm:max-w-md lg:max-w-none">
          <HeroIllustration className="h-auto w-full" />
        </div>
      </Container>
    </section>
  );
}
