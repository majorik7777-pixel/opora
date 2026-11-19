import Link from "next/link";
import { ROUTES } from "@opora/shared";
import { buttonStyles, Container, Logo } from "@opora/ui";

const navItems = [
  { href: "#inside", label: "Что внутри" },
  { href: "#how-it-works", label: "Как это работает" },
  { href: "#pricing", label: "Цена" },
  { href: "#faq", label: "FAQ" },
] as const;

/**
 * Шапка лендинга: липкая, с якорной навигацией на десктопе.
 * На мобильном навигацию не показываем — бургер без JS был бы нечестным,
 * вместо него остаётся главный CTA.
 */
export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-3 lg:h-20">
        <Link
          href={ROUTES.landing}
          aria-label="Опора — на главную"
          className="inline-flex min-h-11 items-center rounded-button pr-1"
        >
          <Logo />
        </Link>

        <nav aria-label="Разделы страницы" className="hidden items-center md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center rounded-button px-3 text-sm font-medium text-muted transition-colors hover:bg-line/40 hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Link
          href={ROUTES.onboarding}
          className={buttonStyles({
            size: "sm",
            className: "shrink-0 whitespace-nowrap",
          })}
        >
          Начать бесплатно
        </Link>
      </Container>
    </header>
  );
}
