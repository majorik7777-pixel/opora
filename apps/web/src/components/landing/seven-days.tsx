import { Container } from "@opora/ui";

const steps = [
  {
    period: "01",
    days: "День 1–2",
    title: "Поймёшь, что с тобой происходит",
    text: "Почему так больно и почему «взять себя в руки» сейчас не работает.",
  },
  {
    period: "02",
    days: "День 3–5",
    title: "Разберёшь мысли, которые добивают",
    text: "Вернёшься к телу, сну и рутине — маленькими шагами, без насилия над собой.",
  },
  {
    period: "03",
    days: "День 6–7",
    title: "Соберёшь личный план",
    text: "Что делать дальше и как действовать, когда накроет снова.",
  },
] as const;

export function SevenDaysSection() {
  return (
    <section
      id="seven-days"
      aria-labelledby="seven-days-title"
      className="bg-moss py-16 text-paper sm:py-20 lg:py-24"
    >
      <Container>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2
            id="seven-days-title"
            className="text-[32px] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[44px] lg:col-span-7 lg:text-[56px]"
          >
            Не «забудь его». Вернуть себя.
          </h2>
          <p className="max-w-md text-lg leading-8 text-moss-soft lg:col-span-5">
            Семь дней — это не марафон. Это один урок и одна практика в день,
            чтобы снова почувствовать почву под ногами.
          </p>
        </div>

        <ol className="mt-10 border-b border-paper/20 sm:mt-14">
          {steps.map((step) => (
            <li
              key={step.period}
              className="grid gap-4 border-t border-paper/20 py-7 sm:grid-cols-12 sm:gap-6 sm:py-9"
            >
              <p className="event-serif text-4xl leading-none text-moss-soft sm:col-span-2 sm:text-5xl">
                {step.period}
              </p>
              <div className="sm:col-span-3">
                <p className="text-sm text-moss-soft">{step.days}</p>
                <h3 className="mt-1 text-xl font-medium leading-snug">
                  {step.title}
                </h3>
              </div>
              <p className="max-w-md text-base leading-7 text-moss-soft sm:col-span-7">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
