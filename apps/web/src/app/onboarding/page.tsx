import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { APP_NAME } from "@opora/shared";
import { Container, Disclaimer, Logo } from "@opora/ui";
import { getCurrentUser } from "@/lib/session";
import { OnboardingWizard } from "./onboarding-wizard";

export const metadata: Metadata = {
  title: "Знакомство",
  robots: { index: false, follow: false },
};

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (user?.hasCompletedOnboarding) {
    redirect("/app");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" aria-label={`${APP_NAME} — на главную`}>
            <Logo />
          </Link>
          <Link
            href={user ? "/app" : "/auth"}
            className="text-sm text-muted underline-offset-2 hover:text-ink hover:underline"
          >
            {user ? "В приложение" : "Уже есть аккаунт? Войти"}
          </Link>
        </Container>
      </header>

      <main className="flex-1 py-8 sm:py-12">
        <Container size="narrow">
          <p className="text-sm text-muted">
            Знакомство · 2 минуты
          </p>
          <h1 className="mt-2 font-sans text-3xl leading-tight text-ink sm:text-4xl">
            Пара вопросов, чтобы подстроиться
          </h1>
          <p className="mt-3 text-base leading-7 text-muted">
            Так «Опора» будет опираться на твою ситуацию, а не на общие слова.
            Можно не указывать имя.
          </p>

          <div className="mt-8">
            <OnboardingWizard authenticated={Boolean(user)} />
          </div>

          <Disclaimer className="mt-8">
            18+. Сервис не ставит диагнозы и не заменяет консультацию врача или
            психотерапевта. Если есть риск для жизни — позвони 112.
          </Disclaimer>
        </Container>
      </main>
    </div>
  );
}
