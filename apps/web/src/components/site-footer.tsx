import Link from "next/link";
import { APP_NAME, ROUTES } from "@opora/shared";
import { Container, Disclaimer, Logo } from "@opora/ui";

const legalLinks = [
  { href: ROUTES.legal.privacy, label: "Политика конфиденциальности" },
  { href: ROUTES.legal.consent, label: "Согласие на обработку данных" },
  { href: ROUTES.legal.terms, label: "Условия использования" },
  { href: ROUTES.legal.offer, label: "Оферта" },
] as const;

/** Подвал для лендинга и юридических страниц. */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-bg">
      <Container className="py-10 sm:py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm space-y-3">
            <Logo />
            <p className="text-sm leading-6 text-muted">
              Инструмент психологической самопомощи и поддержки. Не медицинская
              услуга и не заменяет консультацию специалиста.
            </p>
            <p className="text-sm text-muted">18+ · Сделано с заботой о приватности.</p>
          </div>

          <nav aria-label="Правовая информация" className="grid gap-1">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex min-h-11 items-center text-sm text-muted underline-offset-2 hover:text-ink hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8 space-y-3 border-t border-line pt-6">
          <Disclaimer>
            Если есть угроза жизни или здоровью — позвони 112. Психологическая
            поддержка для взрослых: 8 (495) 989-50-50 (МЧС России), 8 800
            250-18-59 (Российский Красный Крест).
          </Disclaimer>
          <Disclaimer>
            © {year} {APP_NAME}. Переписка и записи дневника не продаются и не
            передаются рекламодателям.
          </Disclaimer>
        </div>
      </Container>
    </footer>
  );
}
