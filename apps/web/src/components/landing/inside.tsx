import { Container } from "@opora/ui";

const inside = [
  {
    title: "Урок дня",
    text: "Короткий, по делу: почему больно, что делать с мыслями, как не писать ему.",
  },
  {
    title: "Практика",
    text: "Пять минут: дыхание, дневник мыслей, ритуал завершения.",
  },
  {
    title: "Дневник",
    text: "Пиши текстом или голосом — AI бережно разберёт, что с тобой происходит.",
  },
  {
    title: "Поддержка",
    text: "Можно написать в любой момент: тебя выслушают и помогут сделать шаг.",
  },
  {
    title: "Отчёт",
    text: "В конце — что изменилось и план на 30 дней.",
  },
] as const;

const howItWorks = [
  {
    number: "01",
    title: "Отвечаешь на 5 вопросов",
    text: "Это займёт две минуты. Можно не указывать имя.",
  },
  {
    number: "02",
    title: "Проходишь первый день бесплатно",
    text: "Пробуешь формат и понимаешь, подходит ли тебе.",
  },
  {
    number: "03",
    title: "Продолжаешь за 990 ₽",
    text: "Семь дней, доступ навсегда, без подписок и скрытых списаний.",
  },
] as const;

export function InsideSection() {
  return (
    <section id="inside" aria-labelledby="inside-title" className="py-16 sm:py-20 lg:py-24">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <h2
            id="inside-title"
            className="text-[32px] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[44px]"
          >
            Внутри — не курс из ста уроков, а 7 дней по 10 минут.
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-muted">
            Каждый день — один урок, одна практика и два вопроса для рефлексии.
            Без домашних заданий на три часа и чувства вины, если пропустила.
          </p>
        </div>

        <ul className="border-b border-line lg:col-span-7">
          {inside.map((item) => (
            <li key={item.title} className="border-t border-line py-5 sm:py-6">
              <div className="grid gap-2 sm:grid-cols-12 sm:items-baseline sm:gap-6">
                <h3 className="text-xl font-medium sm:col-span-4">{item.title}</h3>
                <p className="max-w-lg text-base leading-7 text-muted sm:col-span-8">
                  {item.text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section
      aria-labelledby="how-title"
      className="border-y border-line bg-surface py-16 sm:py-20"
    >
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <h2
            id="how-title"
            className="text-[32px] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[44px]"
          >
            Как это работает
          </h2>
          <p className="event-serif mt-6 max-w-sm text-xl leading-8 text-ink/80">
            Три шага — и ты внутри. Никаких звонков и «подберём специалиста».
          </p>
        </div>

        <ol className="lg:col-span-8">
          {howItWorks.map((step) => (
            <li
              key={step.number}
              className="grid gap-3 border-t border-line py-6 sm:grid-cols-12 sm:items-baseline sm:gap-6 first:border-t-0 first:pt-0"
            >
              <p className="event-serif text-2xl leading-none text-wine sm:col-span-2">
                {step.number}
              </p>
              <h3 className="text-xl font-medium sm:col-span-4">{step.title}</h3>
              <p className="text-base leading-7 text-muted sm:col-span-6">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
