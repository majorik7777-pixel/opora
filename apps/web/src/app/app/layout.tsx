import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { APP_NAME, ROUTES } from "@opora/shared";
import { Container, Logo } from "@opora/ui";
import { BottomNav } from "@/components/app/bottom-nav";
import { getCurrentUser } from "@/lib/session";
import { logoutAction } from "@/server/actions/auth";

export const metadata: Metadata = {
  title: { default: "Главная", template: "%s — Опора" },
  robots: { index: false, follow: false },
};

const navLinks = [
  { href: ROUTES.appChat, label: "Чат" },
  { href: ROUTES.appDiary, label: "Дневник" },
  { href: ROUTES.appProgram, label: "Программа" },
] as const;

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/auth?next=${encodeURIComponent("/app")}`);
  }
  if (!user.hasCompletedOnboarding) {
    redirect("/onboarding");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur">
        <Container className="flex h-16 items-center justify-between gap-2">
          <Link href={ROUTES.app} aria-label={`${APP_NAME} — главная`}>
            <Logo />
          </Link>

          <nav aria-label="Разделы приложения" className="hidden items-center gap-1 sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-11 items-center rounded-field px-3 text-sm text-muted hover:bg-line/30 hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <Link
              href={ROUTES.appSettings}
              aria-label="Настройки"
              className="flex size-11 items-center justify-center rounded-field text-muted hover:bg-line/30 hover:text-ink"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.9 19.3a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.7 8.9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9.1a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.09a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1.03Z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex min-h-11 items-center rounded-field px-3 text-sm text-muted hover:bg-line/30 hover:text-ink"
              >
                Выйти
              </button>
            </form>
          </div>
        </Container>
      </header>

      <main className="flex-1 pb-24 sm:pb-12">{children}</main>

      <BottomNav />
    </div>
  );
}
