import type { Metadata } from "next";
import { Container, Disclaimer } from "@opora/ui";

import { rasstavanie } from "@/content/programs/rasstavanie";
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

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Пережить расставание за 7 дней — программа самопомощи «Опора»",
  description:
    "7-дневная программа поддержки после расставания: уроки, практики, дневник и AI-собеседник. По 10 минут в день. Анонимно, без карты, первый день бесплатно.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Опора",
    url: "/",
    title: "Пережить расставание за 7 дней — «Опора»",
    description:
      "Уроки, практики, дневник и поддержка. По 10 минут в день. Первый день бесплатно, без карты.",
    images: [
      {
        url: "/images/photos/hero-morning-1000.webp",
        width: 1000,
        height: 1250,
        alt: "Женщина у окна с кружкой чая",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Пережить расставание за 7 дней — «Опора»",
    description: "Программа самопомощи: 7 дней по 10 минут. Первый день бесплатно.",
    images: ["/images/photos/hero-morning-1000.webp"],
  },
  robots: { index: true, follow: true },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: rasstavanie.faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "Опора — программа «Пережить расставание»",
  description:
    "7-дневная программа психологической самопомощи после расставания: уроки, практики, дневник и AI-собеседник.",
  brand: { "@type": "Brand", name: "Опора" },
  url: BASE_URL,
  offers: {
    "@type": "Offer",
    price: "990",
    priceCurrency: "RUB",
    availability: "https://schema.org/InStock",
    url: BASE_URL,
  },
};

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col pb-24 md:pb-0">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-button focus:bg-surface focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:text-ink focus:shadow-lift"
      >
        К содержимому
      </a>

      <LandingHeader />

      <main id="main" className="flex-1">
        <Hero program={rasstavanie} />
        <PainSection program={rasstavanie} />
        <SevenDaysSection program={rasstavanie} />
        <InsideSection program={rasstavanie} />
        <SafetySection />
        <PricingSection program={rasstavanie} />
        <FaqSection program={rasstavanie} />
        <FinalCta />

        <div className="border-t border-line">
          <Container size="prose" className="py-8 sm:py-10">
            <Disclaimer>
              Сервис «Опора» — инструмент психологической самопомощи и
              поддержки. Он не является медицинской услугой, не ставит диагнозы
              и не заменяет консультацию врача или психотерапевта. Если есть
              угроза жизни или здоровью — позвони 112. Психологическая
              поддержка: 8 (495) 989-50-50 (МЧС России), 8 800 250-18-59
              (Российский Красный Крест).
            </Disclaimer>
          </Container>
        </div>
      </main>

      <SiteFooter />
      <StickyCta />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
    </div>
  );
}
