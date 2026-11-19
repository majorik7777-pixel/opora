import { Container } from "@opora/ui";

const pains = [
  {
    label: "утро",
    text: "Просыпаешься и сразу вспоминаешь — и день уже испорчен.",
  },
  {
    label: "телефон",
    text: "Не можешь перестать проверять сообщения и соцсети.",
  },
  {
    label: "память",
    text: "Всё напоминает о нём: музыка, улица, чашка.",
  },
  {
    label: "одиночество",
    text: "Хочется поговорить — но не с кем и не хочется объяснять.",
  },
  {
    label: "вина",
    text: "Кажется, что ты недостаточно хороша и всё испортила.",
  },
] as const;

export function SymptomsSection() {
  return (
    <section id="symptoms" aria-labelledby="symptoms-title" className="py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2
            id="symptoms-title"
            className="text-[32px] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[44px] lg:col-span-7 lg:text-[56px]"
          >
            Если сейчас так:
          </h2>
          <p className="max-w-md text-lg leading-8 text-muted lg:col-span-5">
            Это не слабость. Это больно — и с этим можно работать.
          </p>
        </div>

        <ul className="mt-10 border-b border-line sm:mt-14">
          {pains.map((pain) => (
            <li
              key={pain.label}
              className="grid gap-2 border-t border-line py-5 sm:grid-cols-12 sm:items-baseline sm:gap-6 sm:py-6"
            >
              <p className="text-xl leading-snug tracking-[-0.01em] sm:col-span-8 sm:text-2xl">
                {pain.text}
              </p>
              <p className="text-sm text-muted sm:col-span-4 sm:text-right">
                {pain.label}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
