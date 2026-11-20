import type { Metadata, Viewport } from "next";
import "./globals.css";
import { YandexMetrika } from "@/components/analytics/yandex-metrika";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Опора — 7 дней, чтобы вернуть опору после расставания",
    template: "%s — Опора",
  },
  description:
    "Дневник, поддержка и маленькие шаги. 7 дней, чтобы вернуть опору после расставания. Без осуждения и анонимно.",
  applicationName: "Опора",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Опора",
    title: "7 дней, чтобы вернуть опору после расставания",
    description:
      "Дневник, поддержка и маленькие шаги. Без осуждения. Анонимно. Первый день — бесплатно.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbfaf6",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className="min-h-dvh bg-bg font-sans text-ink antialiased">
        {children}
        <YandexMetrika />
      </body>
    </html>
  );
}
