import { Badge, Container } from "@opora/ui";

/** Маршрут из 11-copy.md §1.3: три отрезка недели. */
const steps = [
  {
    day: "День 1–2",
    text: "Поймёшь, что с тобой происходит и почему так больно.",
  },
  {
    day: "День 3–5",
    text: "Разберёшь мысли, которые добивают, и вернёшься к телу и рутине.",
  },
  {
    day: "День 6–7",
    text: "Соберёшь личный план: что делать дальше и как действовать, когда накроет снова.",
  },
] as const;

/**
 * «Не «забудь его». Вернуть себя.» — маршрут недели на белом листе:
 * номера-круги соединены пунктирной линией на десктопе.
 */
export function SevenDaysSection() {
  return (
    <section
      id="program"
      aria-labelledby="program-title"
      className="scroll-mt-20 border-y border-line bg-surface py-14 sm:py-20"
    >
      <Container>
        <h2
          id="program-title"
          className="max-w-2xl font-display text-[1.75rem] leading-[1.25] text-ink sm:text-4xl sm:leading-[1.2]"
        >
          Не «забудь его». Вернуть себя.
        </h2>

        <div className="relative mt-9 sm:mt-12">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-5 hidden border-t border-dashed border-line sm:block"
          />

          <ol className="grid gap-8 sm:grid-cols-3 sm:gap-6">
            {steps.map((step, index) => (
              <li key={step.day} className="relative flex gap-4 sm:block">
                <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface font-display text-lg leading-none text-accent-deep">
                  {index + 1}
                </span>

                <div className="min-w-0 sm:mt-5">
                  <Badge tone="accent">{step.day}</Badge>
                  <p className="mt-3 text-base leading-7 text-ink sm:text-lg sm:leading-8">
                    {step.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
