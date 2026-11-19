import Link from "next/link";
import { ROUTES } from "@opora/shared";
import { Container } from "@opora/ui";

const passport = [
  { title: "Анонимно", text: "Для входа достаточно почты. Имя и фамилию указывать не нужно." },
  { title: "Хранение в РФ", text: "Серверы и базы данных находятся в России, чувствительные поля шифруются." },
  { title: "Кто видит данные", text: "Только сервис и AI-провайдер по поручению. Рекламодателям не передаём." },
  { title: "Удаление и экспорт", text: "Данные можно выгрузить или удалить в настройках — без писем и уговоров." },
  { title: "Не медицина", text: "Сервис не ставит диагнозы и не назначает лечение. Это поддержка и самопомощь." },
  { title: "18+", text: "Сервис только для взрослых. Если нужна помощь специалиста — подскажем, куда обратиться." },
] as const;

export function SafetySection() {
  return (
    <section
      id="safety"
      aria-labelledby="safety-title"
      className="border-t border-line bg-sand py-14 sm:py-20"
    >
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <h2
            id="safety-title"
            className="text-[30px] leading-[1.05] tracking-[-0.03em] sm:text-[40px]"
          >
            Твои переживания — только твои.
          </h2>
          <p className="mt-4 max-w-md text-base leading-7 text-ink/75">
            Психологические данные — особая категория. Поэтому у нас есть
            «паспорт данных»: коротко и по делу, что происходит с твоими
            записями.
          </p>
          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href={ROUTES.legal.privacy} className="text-accent-deep underline underline-offset-4 hover:text-ink">
              Политика конфиденциальности
            </Link>
            <Link href={ROUTES.legal.consent} className="text-accent-deep underline underline-offset-4 hover:text-ink">
              Согласие на обработку
            </Link>
            <Link href={ROUTES.legal.offer} className="text-accent-deep underline underline-offset-4 hover:text-ink">
              Оферта
            </Link>
          </div>
        </div>

        <dl className="border-b border-ink/15 lg:col-span-7">
          {passport.map((item) => (
            <div
              key={item.title}
              className="grid gap-1 border-t border-ink/15 py-4 sm:grid-cols-12 sm:items-baseline sm:gap-6"
            >
              <dt className="text-base font-medium sm:col-span-4">{item.title}</dt>
              <dd className="text-sm leading-6 text-ink/75 sm:col-span-8">{item.text}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
