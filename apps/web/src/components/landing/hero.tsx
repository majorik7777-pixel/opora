import Link from "next/link";
import { ROUTES } from "@opora/shared";
import { buttonStyles, Container } from "@opora/ui";

import type { Program } from "@/content/programs/types";

import { Photo } from "./photo";

export function Hero({ program }: { program: Program }) {
  return (
    <section className="bg-paper">
      <Container className="grid gap-10 py-10 sm:py-14 lg:grid-cols-12 lg:gap-12 lg:py-16">
        <div className="flex flex-col justify-center lg:col-span-6">
          <p className="text-sm text-muted">7-дневная программа · 18+</p>

          <h1 className="mt-4 text-[36px] leading-[1.05] tracking-[-0.03em] sm:text-[48px] lg:text-[56px]">
            {program.headline}
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-ink/75">
            {program.subhead}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={ROUTES.onboarding}
              className={buttonStyles({ variant: "signal", size: "lg" })}
            >
              Пройти первый день бесплатно
            </Link>
            <a
              href="#how"
              className="inline-flex min-h-11 items-center px-1 text-sm text-ink/75 underline underline-offset-4 hover:text-ink"
            >
              Как это устроено
            </a>
          </div>

          <p className="mt-4 text-sm text-muted">{program.heroNote}</p>

          <dl className="mt-10 grid gap-4 border-t border-line pt-6 sm:grid-cols-3">
            {program.heroStats.map((item) => (
              <div key={item.value}>
                <dt className="text-lg font-medium">{item.value}</dt>
                <dd className="mt-1 text-sm leading-6 text-muted">{item.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-6">
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-card border border-line sm:aspect-[5/4] lg:aspect-[4/5]">
              <Photo
                name="hero-morning"
                widths={[640, 1000]}
                width={1000}
                height={1250}
                sizes="(min-width: 1024px) 46vw, 100vw"
                alt="Женщина у окна с кружкой чая ранним утром"
                priority
              />
            </div>

            <div className="relative z-10 mx-4 -mt-16 rounded-card border border-line bg-surface p-4 shadow-lift sm:absolute sm:-bottom-8 sm:left-6 sm:mx-0 sm:mt-0 sm:w-[360px] lg:-bottom-10">
              <div className="flex items-center justify-between gap-3 border-b border-line pb-2 text-xs text-muted">
                <span>Опора · поддержка</span>
                <span>сейчас онлайн</span>
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-6">
                <li className="max-w-[92%] rounded-bubble bg-paper-read px-3 py-2 text-ink/85">
                  Как ты сегодня? Можно не рассказывать словами — просто отметь настроение.
                </li>
                <li className="ml-auto max-w-[88%] rounded-bubble bg-moss-soft px-3 py-2 text-ink">
                  Кажется, я не справляюсь.
                </li>
                <li className="max-w-[92%] rounded-bubble bg-paper-read px-3 py-2 text-ink/85">
                  Это не значит, что ты слабая. Давай начнём с одного маленького шага.
                </li>
              </ul>
              <p className="mt-3 text-xs text-muted">5 сообщений в день бесплатно</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
