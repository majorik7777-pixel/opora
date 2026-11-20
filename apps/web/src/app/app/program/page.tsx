import type { Metadata } from "next";
import Link from "next/link";
import { PROGRAM_LENGTH_DAYS, PROGRAM_PRICE_RUB, ROUTES } from "@opora/shared";
import { getProgramAccess } from "@opora/core";
import { Badge, Card, Container, Disclaimer, buttonStyles } from "@opora/ui";
import { requireOnboardedUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Программа",
  robots: { index: false, follow: false },
};

interface ProgramDayPreview {
  day: number;
  title: string;
  summary: string;
}

const DAYS: readonly ProgramDayPreview[] = [
  {
    day: 1,
    title: "Это больно, и это нормально",
    summary: "Почему больно и почему «взять себя в руки» сейчас не работает.",
  },
  {
    day: 2,
    title: "Контакт",
    summary: "Как сообщения и соцсети держат в петле. Правило контакта на 7 дней.",
  },
  {
    day: 3,
    title: "Мысли, которые добивают",
    summary: "«Я недостаточно хороша» — это мысль, а не факт. Проверяем на прочность.",
  },
  {
    day: 4,
    title: "Ритуал завершения",
    summary: "Письмо, которое не отправишь: завершить, а не «забыть».",
  },
  {
    day: 5,
    title: "Тело и рутина",
    summary: "Сон, еда, движение — три маленьких действия на сегодня.",
  },
  {
    day: 6,
    title: "Поддержка",
    summary: "Скрипт, как попросить близких так, чтобы тебя услышали.",
  },
  {
    day: 7,
    title: "План на 30 дней",
    summary: "Личный план: что делать, если накроет, и куда двигаться дальше.",
  },
];

export default async function ProgramPage() {
  const user = await requireOnboardedUser();
  const access = await getProgramAccess(user.id, "rasstavanie");

  return (
    <Container size="narrow" className="py-8 sm:py-10">
      <p className="text-sm text-muted">
        Программа · каркас Phase 0–1
      </p>
      <h1 className="mt-1 font-sans text-3xl leading-tight text-ink sm:text-4xl">
        Пережить расставание
      </h1>
      <p className="mt-3 text-base leading-7 text-muted">
        {PROGRAM_LENGTH_DAYS} дней по 10 минут: урок, практика и два вопроса для
        рефлексии. В конце — отчёт и план на 30 дней.
      </p>

      {access.active ? (
        <p className="mt-3 inline-flex items-center rounded-full bg-sage-soft px-3 py-1 text-[13px] font-medium text-sage-deep">
          Доступ открыт · оплачено
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link
            href={ROUTES.paywall}
            className={buttonStyles({ variant: "signal", size: "md" })}
            data-ym="program_to_paywall"
          >
            Открыть доступ за {PROGRAM_PRICE_RUB} ₽
          </Link>
          <span className="text-sm text-muted">Первый день — бесплатно</span>
        </div>
      )}

      <Card className="mt-6 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-medium text-ink">Содержание</h2>
          <Badge tone="sage">Первый день — бесплатно</Badge>
        </div>
        <p className="text-sm leading-6 text-muted">
          Полный доступ — {PROGRAM_PRICE_RUB} ₽, навсегда. Возврат — по условиям
          оферты, без давления и таймеров.
        </p>
        <p className="rounded-field border border-dashed border-line bg-bg p-3 text-sm leading-6 text-muted">
          Уроки, практики и прогресс появятся после сборки программы (задача
          T-103). Сейчас здесь — структура и темы.
        </p>
      </Card>

      <ol className="mt-6 space-y-3">
        {DAYS.map((item) => (
          <li key={item.day}>
            <Card padded={false} className="p-4 sm:p-5">
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sage-soft text-sm font-medium text-sage-deep"
                >
                  {item.day}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-medium text-ink">
                      День {item.day}. {item.title}
                    </h2>
                    {item.day === 1 ? <Badge tone="accent">Открыт</Badge> : null}
                  </div>
                  <p className="mt-1 text-sm leading-6 text-muted">{item.summary}</p>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ol>

      <div className="mt-8 space-y-2">
        <Disclaimer>
          Программа — инструмент самопомощи и рефлексии. Она не заменяет
          консультацию врача или психотерапевта и не обещает результата.
        </Disclaimer>
        <Disclaimer>
          Если сейчас есть риск для жизни — позвони 112. Программа подождёт.
        </Disclaimer>
      </div>
    </Container>
  );
}
