import type { Metadata } from "next";
import { Container, Disclaimer } from "@opora/ui";

import { rasstavanie } from "@/content/programs/rasstavanie";
import { FaqSection } from "@/components/landing-v1/faq";
import { FinalCta } from "@/components/landing-v1/final-cta";
import { Hero } from "@/components/landing-v1/hero";
import { InsideSection } from "@/components/landing-v1/inside";
import { LandingHeader } from "@/components/landing-v1/landing-header";
import { PainSection } from "@/components/landing-v1/pain-section";
import { PricingSection } from "@/components/landing-v1/pricing";
import { SafetySection } from "@/components/landing-v1/safety";
import { SevenDaysSection } from "@/components/landing-v1/seven-days";
import { StickyCta } from "@/components/landing-v1/sticky-cta";
import { SiteFooter } from "@/components/site-footer";

const BASE_URL = process.env.APP_URL ?? "https://opora-psihologii.ru";

/**
 * Замороженная версия лендинга №1 (20.11.2026, дизайн v4 «Тихий интерфейс»).
 *
 * Правило версий (docs/design/versions.md): перед каждой правкой лендинга текущие
 * компоненты копируются в `components/landing-vN`, а `/N` продолжает отдавать ту
 * копию. Так можно сравнить варианты, показать инвестору историю и откатиться.
 */
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "Лендинг v1 — «Опора»",
  description:
    "Архивная версия лендинга «Опоры» (20.11.2026): 7-дневная программа психологической самопомощи после расставания.",
  alternates: { canonical: "/1" },
  robots: { index: false, follow: false },
};

export default function LandingV1Page() {
  return (
    <div className="flex min-h-dvh flex-col pb-24 md:pb-0">
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
              Версия лендинга от 20.11.2026. Сервис «Опора» — инструмент
              психологической самопомощи и поддержки. Он не является медицинской
              услугой и не заменяет консультацию специалиста.
            </Disclaimer>
          </Container>
        </div>
      </main>

      <SiteFooter />
      <StickyCta />
    </div>
  );
}
