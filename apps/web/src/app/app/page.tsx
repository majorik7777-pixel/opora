import type { Metadata } from "next";
import Link from "next/link";
import { getOnboardingProfile } from "@opora/core";
import {
  FREE_MESSAGES_PER_DAY,
  PROGRAM_LENGTH_DAYS,
  PROGRAM_PRICE_RUB,
  ROUTES,
  getOnboardingLabel,
} from "@opora/shared";
import {
  Badge,
  Card,
  Container,
  Disclaimer,
  ProgressBar,
  buttonStyles,
} from "@opora/ui";
import { requireOnboardedUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Главная",
  robots: { index: false, follow: false },
};

const GOAL_LINES: Record<string, string> = {
  stop_thinking:
    "Ты здесь, чтобы перестать прокручивать это в голове. Начнём с одного маленького шага — прямо сегодня.",
  recover_strength:
    "Ты хочешь вернуть себе силы. Это не про «взять себя в руки» — это про маленькие шаги и бережность к себе.",
  understand_next:
    "Ты хочешь понять, что делать дальше. Не нужно решать всё сразу — разберёмся по шагам.",
  be_heard:
    "Ты хочешь, чтобы кто-то выслушал. Здесь можно говорить как есть — без осуждения и оценок.",
};

export default async function AppHomePage() {
  const user = await requireOnboardedUser();
  const profile = await getOnboardingProfile(user.id);

  const goalLine = profile?.answers.goal
    ? GOAL_LINES[profile.answers.goal] ??
      "Первый шаг уже сделан — этого достаточно, чтобы начать."
    : "Первый шаг уже сделан — этого достаточно, чтобы начать.";

  const situation = profile?.answers.situation
    ? getOnboardingLabel("situation", profile.answers.situation)
    : null;

  return (
    <Container size="narrow" className="py-8 sm:py-10">
      <p className="text-sm font-medium uppercase tracking-wide text-muted">
        Твоя опора
      </p>
      <h1 className="mt-1 font-display text-3xl leading-tight text-ink sm:text-4xl">
        Привет.
      </h1>
      <p className="mt-3 text-base leading-7 text-ink/90">{goalLine}</p>
      {situation ? (
        <p className="mt-1 text-sm text-muted">
          Ты отметила: {situation.toLowerCase()}.
        </p>
      ) : null}

      <Card className="mt-7 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted">Программа «Пережить расставание»</p>
            <h2 className="mt-0.5 text-xl font-medium text-ink">
              День 1 из {PROGRAM_LENGTH_DAYS}
            </h2>
          </div>
          <Badge tone="sage">Первый день — бесплатно</Badge>
        </div>
        <ProgressBar
          value={Math.round(100 / PROGRAM_LENGTH_DAYS)}
          ariaLabel={`Программа «Пережить расставание»: день 1 из ${PROGRAM_LENGTH_DAYS}`}
        />
        <p className="text-sm leading-6 text-muted">
          Тема дня — «Это больно, и это нормально». Внутри: короткий урок,
          практика и два вопроса для рефлексии. Всего 10 минут.
        </p>
        <Link
          href={ROUTES.appProgram}
          className={buttonStyles({ fullWidth: true })}
        >
          Открыть первый день
        </Link>
      </Card>

      <section aria-labelledby="quick-actions" className="mt-9">
        <h2 id="quick-actions" className="text-lg font-medium text-ink">
          Быстрые действия
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Link
            href={ROUTES.appChat}
            className="group rounded-card border border-line bg-surface p-5 shadow-soft transition-colors hover:border-accent/40 hover:bg-accent-soft/20"
          >
            <h3 className="text-base font-medium text-ink">
              Поговорить с Опорой
            </h3>
            <p className="mt-1 text-sm leading-6 text-muted">
              Выговориться без осуждения: {FREE_MESSAGES_PER_DAY} сообщений в
              день бесплатно.
            </p>
            <span className="mt-3 inline-block text-sm text-accent-deep">
              Открыть чат →
            </span>
          </Link>

          <Link
            href={ROUTES.appDiary}
            className="group rounded-card border border-line bg-surface p-5 shadow-soft transition-colors hover:border-accent/40 hover:bg-accent-soft/20"
          >
            <h3 className="text-base font-medium text-ink">Записать в дневник</h3>
            <p className="mt-1 text-sm leading-6 text-muted">
              Как ты сейчас? Настроение, мысли, что помогло.
            </p>
            <span className="mt-3 inline-block text-sm text-accent-deep">
              Открыть дневник →
            </span>
          </Link>
        </div>
      </section>

      <section aria-labelledby="program-cta" className="mt-9">
        <h2 id="program-cta" className="text-lg font-medium text-ink">
          Программа
        </h2>
        <Card className="mt-3 space-y-3">
          <p className="text-sm leading-6 text-muted">
            7 дней по 10 минут: урок, практика, рефлексия и финальный отчёт с
            планом на 30 дней. Первый день — бесплатно, весь доступ —{" "}
            {PROGRAM_PRICE_RUB} ₽ навсегда.
          </p>
          <Link
            href={ROUTES.appProgram}
            className={buttonStyles({ variant: "secondary", fullWidth: true })}
          >
            Посмотреть программу
          </Link>
        </Card>
      </section>

      <Card className="mt-9 space-y-2 bg-sage-soft/50">
        <h2 className="text-lg font-medium text-ink">
          Если сейчас очень тяжело
        </h2>
        <p className="text-sm leading-6 text-ink/80">
          Не оставайся с этим одна. Позвони 112 — это бесплатно и
          круглосуточно. Приложение рядом, но оно не заменяет экстренную
          помощь.
        </p>
      </Card>

      <div className="mt-8 space-y-2">
        <Disclaimer>
          Все данные хранятся в России. Переписка и записи дневника не
          продаются и не передаются рекламодателям.
        </Disclaimer>
        <Disclaimer>
          Сервис не ставит диагнозы и не заменяет консультацию специалиста. 18+.
        </Disclaimer>
      </div>
    </Container>
  );
}
