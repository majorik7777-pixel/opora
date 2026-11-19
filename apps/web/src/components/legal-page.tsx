import Link from "next/link";
import { CONSENT_VERSION } from "@opora/shared";
import { Disclaimer } from "@opora/ui";

export interface LegalPageProps {
  title: string;
  /** Версия/дата редакции документа. */
  version?: string;
  children: React.ReactNode;
}

/**
 * Общий каркас юридической страницы: заголовок, версия, текст, пометка о том,
 * что документ требует проверки юристом до публичного запуска.
 */
export function LegalPage({ title, version = CONSENT_VERSION, children }: LegalPageProps) {
  return (
    <article>
      <p className="text-sm text-muted">Редакция от {formatVersion(version)}</p>
      <h1 className="mt-2 font-sans text-3xl leading-tight text-ink sm:text-4xl">
        {title}
      </h1>
      <div className="legal-prose mt-6">{children}</div>

      <div className="mt-10 space-y-3 border-t border-line pt-6">
        <Disclaimer>
          Это черновик документа для Phase 0–1. Перед публичным запуском текст
          проверяет юрист; реквизиты оператора и контакты будут добавлены.
        </Disclaimer>
        <p className="text-sm text-muted">
          См. также{" "}
          <Link href="/legal/privacy" className="text-accent-deep underline underline-offset-2">
            политику конфиденциальности
          </Link>{" "}
          и{" "}
          <Link href="/legal/consent" className="text-accent-deep underline underline-offset-2">
            согласие на обработку данных
          </Link>
          .
        </p>
      </div>
    </article>
  );
}

function formatVersion(version: string): string {
  const [year, month, day] = version.split("-");
  if (!year || !month || !day) return version;
  return `${day}.${month}.${year}`;
}
