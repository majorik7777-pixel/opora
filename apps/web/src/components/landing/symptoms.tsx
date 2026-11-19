import { Card, Container } from "@opora/ui";

/** Боли из 11-copy.md §1.2 — дословно, без усиления и без «продающих» надстроек. */
const pains = [
  "Просыпаешься и сразу вспоминаешь — и день уже испорчен.",
  "Не можешь перестать проверять сообщения и соцсети.",
  "Всё напоминает о нём: музыка, улица, чашка.",
  "Хочется поговорить — но не с кем и не хочется объяснять.",
  "Кажется, что ты недостаточно хороша и всё испортила.",
] as const;

/**
 * Блок «Если сейчас так»: пять карточек вместо стены текста
 * и спокойная подпись-опора. Никакой жалости и «розовых» акцентов.
 */
export function SymptomsSection() {
  return (
    <section
      id="symptoms"
      aria-labelledby="symptoms-title"
      className="scroll-mt-20 py-14 sm:py-20"
    >
      <Container>
        <h2
          id="symptoms-title"
          className="max-w-2xl font-display text-[1.75rem] leading-[1.25] text-ink sm:text-4xl sm:leading-[1.2]"
        >
          Если сейчас так:
        </h2>

        <ul className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {pains.map((pain) => (
            <li key={pain} className="h-full">
              <Card className="h-full">
                <span
                  aria-hidden="true"
                  className="block h-px w-8 bg-sage"
                />
                <p className="mt-4 text-base leading-7 text-ink">{pain}</p>
              </Card>
            </li>
          ))}
        </ul>

        <p className="mt-8 flex items-start gap-3 rounded-card bg-sage-soft px-5 py-4 text-sage-deep sm:mt-10 sm:items-center sm:px-6 sm:py-5">
          <span
            aria-hidden="true"
            className="mt-2.5 size-1.5 shrink-0 rounded-full bg-sage-deep sm:mt-0"
          />
          <span className="font-display text-lg leading-7 sm:text-xl sm:leading-8">
            Это не слабость. Это больно — и с этим можно работать.
          </span>
        </p>
      </Container>
    </section>
  );
}
