import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { ROUTES } from "@opora/shared";
import { Container, Disclaimer, buttonStyles } from "@opora/ui";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Аккаунт создан",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Страница успешной регистрации (T-101+).
 *
 * Нужна не только человеку, но и аналитике: цель «регистрация» в Яндекс.Метрике
 * считается по визиту этого URL, поэтому срабатывает даже с блокировщиком
 * рекламы (JS-событие `signup_complete` — второй, не единственный путь).
 */
export default async function WelcomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth");

  return (
    <Container size="narrow" className="py-12 sm:py-16">
      <p className="inline-flex items-center rounded-full bg-sage-soft px-3.5 py-1.5 text-[13px] font-medium text-sage-deep">
        Аккаунт создан
      </p>
      <h1 className="mt-5 text-3xl leading-tight tracking-[-0.03em] sm:text-4xl">
        Ты внутри. Первый шаг уже сделан.
      </h1>
      <p className="mt-4 max-w-lg text-base leading-7 text-muted">
        Дальше — программа и дневник. Можно начать сегодня: первый день занимает
        около десяти минут.
      </p>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href={ROUTES.app}
          className={buttonStyles({ variant: "signal", size: "lg" })}
          data-ym="welcome_to_app"
        >
          Перейти к программе
        </Link>
        <Link
          href={ROUTES.appChat}
          className={buttonStyles({ variant: "secondary", size: "lg" })}
          data-ym="welcome_to_chat"
        >
          Поговорить с Опорой
        </Link>
      </div>

      <p className="mt-4 text-sm text-muted">
        Анонимно · без карты · 18+
      </p>

      <div className="mt-10 space-y-2">
        <Disclaimer>
          Опора — инструмент психологической самопомощи, а не медицинская услуга.
        </Disclaimer>
      </div>
    </Container>
  );
}
