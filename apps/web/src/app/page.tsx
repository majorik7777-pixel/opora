import type { Metadata } from "next";

import { Container, Disclaimer } from "@opora/ui";

import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/landing/hero";
import { LandingHeader } from "@/components/landing/landing-header";
import { HowItWorksSection, InsideSection } from "@/components/landing/inside";
import { FaqSection, PricingSection } from "@/components/landing/pricing";
import { SafetySection } from "@/components/landing/safety";
import { SevenDaysSection } from "@/components/landing/seven-days";
import { SymptomsSection } from "@/components/landing/symptoms";

export const metadata: Metadata = {
  title: "7 дней, чтобы вернуть опору после расставания",
  description: "Дневник, поддержка и маленькие шаги. Без осуждения. Анонимно.",
};

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-button focus:bg-surface focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:text-ink focus:shadow-lift"
      >
        К содержимому
      </a>

      <LandingHeader />

      <main id="main" className="flex-1">
        <Hero />
        <SymptomsSection />
        <SevenDaysSection />
        <InsideSection />
        <HowItWorksSection />
        <SafetySection />
        <PricingSection />
        <FaqSection />

        {/* Дисклеймер §1.9 — последний спокойный текст перед подвалом. */}
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
    </div>
  );
}
