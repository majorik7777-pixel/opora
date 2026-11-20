import { Container } from "@opora/ui";

import type { Program } from "@/content/programs/types";

import { Photo } from "./photo";

export function SevenDaysSection({ program }: { program: Program }) {
  return (
    <section id="how" aria-labelledby="how-title" className="bg-surface">
      <Container className="grid gap-0 lg:grid-cols-12">
        <div className="py-14 sm:py-16 lg:col-span-6 lg:py-20 lg:pr-10">
          <h2
            id="how-title"
            className="text-[32px] leading-[1.06] tracking-[-0.03em] sm:text-[44px]"
          >
            Не «забудь его». Вернуть себя.
          </h2>
          <p className="mt-5 max-w-md text-lg leading-8 text-muted">
            Семь дней — это не марафон. Один урок и одна практика в день, чтобы
            снова почувствовать почву под ногами.
          </p>

          <ol className="mt-8 flex flex-wrap gap-2" aria-label="Семь дней программы">
            {program.dayTitles.map((title, index) => (
              <li key={title}>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-sm font-semibold tabular-nums text-accent-strong">
                  {index + 1}
                </span>
                <span className="sr-only">{title}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-muted">
            7 дней · урок → практика → дневник → поддержка
          </p>

          <ol className="mt-9 divide-y divide-line border-y border-line">
            {program.sevenDays.map((step) => (
              <li
                key={step.period}
                className="grid gap-2 py-5 sm:grid-cols-12 sm:gap-5"
              >
                <p className="event-serif text-3xl leading-none text-accent-strong sm:col-span-2">
                  {step.period}
                </p>
                <div className="sm:col-span-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted">
                    {step.days}
                  </p>
                  <h3 className="mt-1.5 text-lg font-semibold leading-snug">
                    {step.title}
                  </h3>
                </div>
                <p className="text-sm leading-6 text-muted sm:col-span-6">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="relative min-h-[280px] lg:col-span-6 lg:min-h-full">
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
