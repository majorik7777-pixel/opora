import Link from "next/link";
import { ROUTES } from "@opora/shared";
import { Container } from "@opora/ui";

const points = [
  {
    title: "Анонимно",
    text: "Можно не указывать имя и фамилию. Для входа достаточно почты.",
  },
  {
    title: "Данные — в России",
    text: "Серверы и базы данных находятся в РФ. Чувствительные поля шифруются.",
  },
  {
    title: "Не медицина",
    text: "Сервис не ставит диагнозы и не назначает лечение. Это поддержка и самопомощь.",
  },
  {
    title: "Удаление данных",
    text: "Данные можно удалить — без писем в поддержку и уговоров остаться.",
  },
  {
    title: "18+",
    text: "Сервис только для взрослых. Если нужна помощь специалиста — подскажем, куда обратиться.",
  },
] as const;

export function SafetySection() {
  return (
    <section
      id="safety"
      aria-labelledby="safety-title"
      className="bg-sand py-16 sm:py-20 lg:py-24"
    >
      <Container>
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2
            id="safety-title"
            className="text-[32px] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[44px] lg:col-span-7 lg:text-[56px]"
          >
            Твои переживания — только твои.
          </h2>
          <p className="max-w-md text-lg leading-8 text-ink/75 lg:col-span-5">
            Мы не продаём переписку и не передаём её рекламодателям. Это не
            медицина и не «терапия» — это инструмент, который помогает
            справляться самой.
          </p>
        </div>

        <ul className="mt-10 grid gap-x-10 border-b border-ink/15 sm:mt-14 md:grid-cols-2">
          {points.map((point) => (
            <li key={point.title} className="border-t border-ink/15 py-5">
              <h3 className="text-base font-medium">{point.title}</h3>
              <p className="mt-1 text-sm leading-6 text-ink/75">{point.text}</p>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href={ROUTES.legal.privacy} className="text-accent-deep underline underline-offset-4 hover:text-ink">
            Политика конфиденциальности
          </Link>
          <Link href={ROUTES.legal.consent} className="text-accent-deep underline underline-offset-4 hover:text-ink">
            Согласие на обработку данных
          </Link>
          <Link href={ROUTES.legal.offer} className="text-accent-deep underline underline-offset-4 hover:text-ink">
            Оферта
          </Link>
        </div>
      </Container>
    </section>
  );
}
