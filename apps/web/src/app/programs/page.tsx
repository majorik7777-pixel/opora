import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@opora/ui";

import { listCatalogPrograms } from "@opora/core";
import { getProgramContent } from "@/content/programs";
import { LandingHeader } from "@/components/landing/landing-header";
import { SiteFooter } from "@/components/site-footer";

const BASE_URL = process.env.APP_URL ?? "https://opora-psihologii.ru";

/**
 * Хаб программ (И-7). Пока программ одна, страница не в главном меню: она нужна
 * как точка роста — с второй программой `/` станет хабом, а сюда придут ссылки
 * из статей и sitemap. Источник — каталог БД, а не ручной список.
 */
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Программы — «Опора»",
  description:
    "Короткие программы психологической самопомощи: семь дней по десять минут, дневник и поддержка.",
  alternates: { canonical: "/programs" },
};

export default async function ProgramsPage() {
  const programs = await listCatalogPrograms({ onlyPublished: true });

  return (
    <div className="flex min-h-dvh flex-col">
      <LandingHeader />
      <main id="main" className="flex-1">
        <Container size="prose" className="py-14 sm:py-20">
          <h1 className="text-[38px] leading-[1.06] sm:text-[52px]">
            Программы
          </h1>
          <p className="mt-4 text-lg text-muted">
            Семь дней по десять минут: урок, практика, дневник и поддержка.
          </p>

          <ul className="mt-10 divide-y divide-line border-y border-line">
            {programs.map((program) => {
              const content = getProgramContent(program.slug);
              return (
                <li key={program.slug}>
                  <Link
                    href={`/programs/${program.slug}`}
                    className="group flex flex-col gap-2 py-6 sm:flex-row sm:items-baseline sm:justify-between"
                  >
                    <span className="text-xl font-medium">
                      {content?.name ?? program.title}
                    </span>
                    <span className="text-sm text-muted">
                      {program.priceRub > 0 ? `${program.priceRub} ₽` : "бесплатно"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </main>
      <SiteFooter />
    </div>
  );
}
