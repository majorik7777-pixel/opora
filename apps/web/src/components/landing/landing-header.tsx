import Link from "next/link";
import { ROUTES } from "@opora/shared";
import { buttonStyles, Container, Logo } from "@opora/ui";

const nav = [
  { href: "#seven-days", label: "Как это работает" },
  { href: "#inside", label: "Что внутри" },
  { href: "#pricing", label: "Цена" },
  { href: "#faq", label: "FAQ" },
] as const;

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href={ROUTES.landing} aria-label="Опора — на главную">
          <Logo />
        </Link>

        <nav aria-label="Разделы страницы" className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex min-h-11 items-center px-3 text-sm text-muted transition-colors hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Link
          href={ROUTES.onboarding}
          className={buttonStyles({ variant: "signal", size: "sm" })}
        >
          Начать бесплатно
        </Link>
      </Container>
    </header>
  );
}
