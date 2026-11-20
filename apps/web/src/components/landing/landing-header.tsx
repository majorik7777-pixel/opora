import Link from "next/link";
import { ROUTES } from "@opora/shared";
import { buttonStyles, Container, Logo } from "@opora/ui";

const nav = [
  { href: "#how", label: "Как это работает" },
  { href: "#inside", label: "Что внутри" },
  { href: "#safety", label: "Приватность" },
  { href: "#pricing", label: "Цена" },
  { href: "#faq", label: "Вопросы" },
] as const;

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur-md">
      <Container className="flex h-[72px] items-center justify-between gap-4">
        <Link href={ROUTES.landing} aria-label="Опора — на главную">
          <Logo />
        </Link>

        <nav aria-label="Разделы страницы" className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex min-h-11 items-center rounded-xl px-3 text-sm text-muted transition-colors hover:bg-accent-soft/50 hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Одна primary на экран: на мобильном кнопку в шапке не показываем —
            её роль выполняет кнопка в hero. */}
        <div className="hidden md:block">
          <Link
            href={ROUTES.onboarding}
            className={buttonStyles({ variant: "signal", size: "sm" })}
            data-ym="cta_header"
          >
            Пройти первый день бесплатно
          </Link>
        </div>
        <a
          href="#pricing"
          className="inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-ink md:hidden"
        >
          Цена
        </a>
      </Container>
    </header>
  );
}
