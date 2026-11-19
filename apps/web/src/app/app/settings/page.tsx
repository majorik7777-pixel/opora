import type { Metadata } from "next";
import Link from "next/link";
import { CONSENT_VERSION, ROUTES } from "@opora/shared";
import { Card, Container, Disclaimer } from "@opora/ui";
import { requireOnboardedUser } from "@/lib/session";
import { logoutAction } from "@/server/actions/auth";

export const metadata: Metadata = {
  title: "Настройки",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const user = await requireOnboardedUser();
  const createdAt = new Date(user.createdAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Container size="narrow" className="py-8 sm:py-10">
      <p className="text-sm text-muted">
        Аккаунт
      </p>
      <h1 className="mt-1 font-sans text-3xl leading-tight text-ink sm:text-4xl">
        Настройки
      </h1>

      <Card className="mt-6 space-y-4">
        <div>
          <h2 className="text-base font-medium text-ink">Вход</h2>
          <p className="mt-1 text-sm leading-6 text-muted">
            Почта: <span className="text-ink">{user.email}</span>
            <br />
            Аккаунт создан: {createdAt}. Возраст подтверждён: да.
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="min-h-11 rounded-field border border-line bg-surface px-4 text-sm text-ink hover:border-accent/40 hover:bg-accent-soft/20"
          >
            Выйти из аккаунта
          </button>
        </form>
      </Card>

      <Card className="mt-4 space-y-3">
        <h2 className="text-base font-medium text-ink">Данные и приватность</h2>
        <p className="text-sm leading-6 text-muted">
          Ответы онбординга и записи дневника хранятся в России в зашифрованном
          виде. Согласия зафиксированы с версией {CONSENT_VERSION}.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled
            className="min-h-11 cursor-not-allowed rounded-field border border-line bg-bg px-4 text-sm text-muted"
          >
            Скачать мои данные
          </button>
          <button
            type="button"
            disabled
            className="min-h-11 cursor-not-allowed rounded-field border border-line bg-bg px-4 text-sm text-muted"
          >
            Удалить аккаунт
          </button>
        </div>
        <p className="rounded-field border border-dashed border-line bg-bg p-3 text-sm leading-6 text-muted">
          Экспорт и удаление появятся вместе с настройками данных. До этого
          времени их можно запросить через поддержку — без объяснений и причин.
        </p>
      </Card>

      <Card className="mt-4 space-y-2">
        <h2 className="text-base font-medium text-ink">Документы</h2>
        <ul className="space-y-1 text-sm">
          <li>
            <Link href={ROUTES.legal.privacy} className="text-accent-deep underline underline-offset-2">
              Политика конфиденциальности
            </Link>
          </li>
          <li>
            <Link href={ROUTES.legal.consent} className="text-accent-deep underline underline-offset-2">
              Согласие на обработку данных
            </Link>
          </li>
          <li>
            <Link href={ROUTES.legal.offer} className="text-accent-deep underline underline-offset-2">
              Оферта
            </Link>
          </li>
          <li>
            <Link href={ROUTES.legal.terms} className="text-accent-deep underline underline-offset-2">
              Условия использования
            </Link>
          </li>
        </ul>
      </Card>

      <div className="mt-8 space-y-2">
        <Disclaimer>
          Сервис не является медицинской услугой и не заменяет экстренную
          помощь. Если есть риск для жизни — позвони 112.
        </Disclaimer>
      </div>
    </Container>
  );
}
