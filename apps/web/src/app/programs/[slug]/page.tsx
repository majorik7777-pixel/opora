import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container, Disclaimer } from "@opora/ui";

import { getProgramContent } from "@/content/programs";
import { getPublishedProgram } from "@opora/core";
import { FaqSection } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Hero } from "@/components/landing/hero";
import { InsideSection } from "@/components/landing/inside";
import { LandingHeader } from "@/components/landing/landing-header";
import { PainSection } from "@/components/landing/pain-section";
import { PricingSection } from "@/components/landing/pricing";
import { SafetySection } from "@/components/landing/safety";
import { SevenDaysSection } from "@/components/landing/seven-days";
import { StickyCta } from "@/components/landing/sticky-cta";
import { SiteFooter } from "@/components/site-footer";

const BASE_URL = process.env.APP_URL ?? "https://opora-psihologii.ru";

/**
 * Страница программы (И-7). Одна и та же вёрстка для всех программ: контент
 * приходит из реестра, доступность и цена — из каталога БД. Пока программа
 * одна, `/` остаётся продающим лендингом; с появлением второй `/` станет
 * хабом, а оффер переедет сюда 301-редиректом (D-035, scalability §2).
 */
type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const [program, content] = await Promise.all([
    getPublishedProgram(slug),
    Promise.resolve(getProgramContent(slug)),
  ]);

  if (!program || !content) {
    return { title: "Программа не найдена — «Опора»", robots: { index: false } };
  }

  const title = `${content.headline} — «Опора»`;
  return {
    metadataBase: new URL(BASE_URL),
    title,
    description: content.subhead,
    alternates: { canonical: `/programs/${slug}` },
    openGraph: {
      title,
      description: content.subhead,
      url: `${BASE_URL}/programs/${slug}`,
      type: "website",
      locale: "ru_RU",
    },
  };
}

export default async function ProgramPage({ params }: Params) {
  const { slug } = await params;
  const [program, content] = await Promise.all([
    getPublishedProgram(slug),
    Promise.resolve(getProgramContent(slug)),
  ]);

  if (!program || !content) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: content.headline,
    description: content.subhead,
    brand: { "@type": "Brand", name: "Опора" },
    offers: {
      "@type": "Offer",
      price: program.priceRub,
      priceCurrency: "RUB",
      availability: "https://schema.org/InStock",
      url: `${BASE_URL}/programs/${slug}`,
    },
  };

  return (
    <div className="flex min-h-dvh flex-col pb-24 md:pb-0">
      <LandingHeader />

      <main id="main" className="flex-1">
        <Hero program={content} />
        <PainSection program={content} />
        <SevenDaysSection program={content} />
        <InsideSection program={content} />
        <SafetySection />
        <PricingSection program={content} />
        <FaqSection program={content} />
        <FinalCta />

        <div className="border-t border-line">
          <Container size="prose" className="py-8 sm:py-10">
            <Disclaimer>
              «Опора» — инструмент психологической самопомощи и поддержки. Он не
              является медицинской услугой и не заменяет консультацию специалиста.
            </Disclaimer>
          </Container>
        </div>
      </main>

      <SiteFooter />
      <StickyCta />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
