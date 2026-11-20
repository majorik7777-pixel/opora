import { Container } from "@opora/ui";

import type { Program } from "@/content/programs/types";

import { Photo } from "./photo";

export function SevenDaysSection({ program }: { program: Program }) {
  return (
    <section id="how" aria-labelledby="how-title" className="bg-surface">
      <Container className="grid gap-0 lg:grid-cols-12">
        <div className="min-w-0 py-10 sm:py-16 lg:col-span-6 lg:py-20 lg:pr-10">
          <h2
            id="how-title"
            className="text-[32px] leading-[1.06] tracking-[-0.03em] sm:text-[44px]"
          >
            Не «забудь его». Вернуть себя.
          </h2>
          <p className="mt-4 max-w-md text-[17px] leading-7 text-muted sm:mt-5 sm:text-lg sm:leading-8">
            Семь дней — это не марафон. Один урок и одна практика в день, чтобы
            снова почувствовать почву под ногами.
          </p>

          <ol className="mt-7 divide-y divide-line border-y border-line">
            {program.sevenDays.map((step) => (
              <li
                key={step.period}
                className="grid gap-1.5 py-4 sm:grid-cols-12 sm:gap-5 sm:py-5"
              >
                <div className="flex items-baseline gap-3 sm:col-span-2 sm:block">
                  <p className="event-serif text-2xl leading-none text-accent-strong sm:text-3xl">
                    {step.period}
                  </p>
                  <p className="text-[13px] uppercase tracking-[0.12em] text-muted sm:mt-2">
                    {step.days}
                  </p>
                </div>
                <h3 className="text-lg font-semibold leading-snug sm:col-span-4">
                  {step.title}
                </h3>
                <p className="text-[15px] leading-6 text-muted sm:col-span-6">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-[15px] text-muted">
            7 дней · урок → практика → дневник → поддержка
          </p>
        </div>

        <div className="relative hidden min-h-[280px] sm:block lg:col-span-6 lg:min-h-full">
          <Photo
            name="seven-days"
            widths={[800, 1600]}
            width={1600}
            height={1067}
            sizes="(min-width: 1024px) 50vw, 100vw"
            alt="Женщина идёт под дождём по осеннему двору"
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </Container>
    </section>
  );
}
