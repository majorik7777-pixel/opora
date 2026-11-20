import Link from "next/link";
import { ROUTES } from "@opora/shared";
import { buttonStyles, Container } from "@opora/ui";

import { Photo } from "./photo";

export function FinalCta() {
  return (
    <section aria-labelledby="final-title" className="border-t border-line py-14 sm:py-20">
      <Container className="grid items-stretch gap-6 lg:grid-cols-12 lg:gap-10">
        <div className="relative min-h-[280px] overflow-hidden rounded-card border border-line sm:min-h-[320px] lg:col-span-6">
          <Photo
            name="final-window"
            widths={[800, 1600]}
            width={1600}
            height={1067}
            sizes="(min-width: 1024px) 48vw, 100vw"
            alt="Женщина стоит у окна в светлой комнате и смотрит на улицу"
            className="absolute inset-0 object-[62%_35%]"
          />
        </div>

        <div className="flex flex-col justify-center rounded-card bg-surface p-6 shadow-soft sm:p-8 lg:col-span-6">
          <p className="inline-flex w-fit items-center rounded-full bg-accent-soft px-3 py-1 text-[13px] font-medium text-accent-strong">
            Первый шаг — бесплатно
          </p>
          <h2
            id="final-title"
            className="mt-4 text-[28px] leading-[1.08] tracking-[-0.03em] sm:text-[38px]"
          >
            Начни сегодня. Десять минут — и станет чуть легче.
          </h2>
          <p className="mt-3 max-w-md text-base leading-7 text-muted">
            Первый день программы бесплатно: посмотришь, как всё устроено, и
            поймёшь, подходит ли тебе формат. Без карты и обязательств.
          </p>
          <div className="mt-6">
            <Link
              href={ROUTES.onboarding}
              className={buttonStyles({ variant: "signal", size: "lg" })}
              data-ym="cta_final"
            >
              Пройти первый день бесплатно
            </Link>
          </div>
          <p className="mt-3 text-sm text-muted">Анонимно · без подписки · 18+</p>
        </div>
      </Container>
    </section>
  );
}
