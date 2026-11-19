import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { APP_NAME } from "@opora/shared";
import { Container, Disclaimer, Logo } from "@opora/ui";
import { getCurrentUser } from "@/lib/session";
import { AuthForm } from "./auth-form";

export const metadata: Metadata = {
  title: "Вход",
  robots: { index: false, follow: false },
};

const errors: Record<string, string> = {
  "missing-token": "Ссылка неполная. Запроси новую — это займёт полминуты.",
  "invalid-link":
    "Ссылка уже использована или истекла. Запроси новую — это займёт полминуты.",
};

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (user) {
    redirect(user.hasCompletedOnboarding ? "/app" : "/onboarding");
  }

  const errorMessage = params.error ? errors[params.error] : undefined;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line">
        <Container className="flex h-16 items-center">
          <Link href="/" aria-label={`${APP_NAME} — на главную`}>
            <Logo />
          </Link>
        </Container>
      </header>

      <main className="flex-1 py-10 sm:py-16">
        <Container size="narrow">
          <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
            Вход в «Опору»
          </h1>
          <p className="mt-3 text-base leading-7 text-muted">
            Введёшь почту — пришлём ссылку для входа. Без пароля: пароль можно
            забыть, а ссылка живёт 20 минут.
          </p>

          {errorMessage ? (
            <p
              role="alert"
              className="mt-6 rounded-field border border-danger/30 bg-danger/5 px-4 py-3 text-sm leading-6 text-danger"
            >
              {errorMessage}
            </p>
          ) : null}

          <div className="mt-8">
            <AuthForm />
          </div>

          <div className="mt-10 space-y-2 border-t border-line pt-6">
            <Disclaimer>
              Почта нужна только для входа и напоминаний. Переписка и дневник не
              передаются третьим лицам, кроме технических подрядчиков, без
              которых сервис не работает.
            </Disclaimer>
            <Disclaimer>
              18+. Сервис не является медицинской услугой и не заменяет
              консультацию специалиста.
            </Disclaimer>
          </div>
        </Container>
      </main>
    </div>
  );
}
