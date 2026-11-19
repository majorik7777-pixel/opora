import Link from "next/link";
import { ROUTES } from "@opora/shared";
import { buttonStyles, Container, Logo } from "@opora/ui";

/** Простая шапка для юридических страниц и служебных экранов. */
export function SiteHeader() {
  return (
    <header className="border-b border-line bg-bg">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href={ROUTES.landing} aria-label="Опора — на главную">
          <Logo />
        </Link>
        <Link
          href={ROUTES.onboarding}
          className={buttonStyles({ size: "sm", variant: "secondary" })}
        >
          Начать бесплатно
        </Link>
      </Container>
    </header>
  );
}
