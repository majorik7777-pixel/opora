/** Название продукта (рабочее, D-017). */
export const APP_NAME = "Опора";

/** Длина первой программы «Пережить расставание», дней (D-022, 09-product-spec §4). */
export const PROGRAM_LENGTH_DAYS = 7;

/** Бесплатный лимит сообщений в день (D-007). */
export const FREE_MESSAGES_PER_DAY = 5;

/** Стартовая цена программы, ₽ (D-007). */
export const PROGRAM_PRICE_RUB = 990;

/** Версия текстов согласий — меняется при изменении юридических документов. */
export const CONSENT_VERSION = "2026-11-19";

/** Версия схемы онбординга: нужна для миграций и аналитики. */
export const ONBOARDING_VERSION = "2026-11-19";

export const MIN_AGE = 18;

/** Имена httpOnly-cookie (см. packages/core/src/auth.ts). */
export const COOKIE_NAMES = {
  session: "opora_session",
  onboardingDraft: "opora_onboarding_draft",
} as const;

/** Время жизни токенов. */
export const AUTH_TTL = {
  magicLinkMinutes: 20,
  sessionDays: 30,
  onboardingDraftMinutes: 60,
} as const;

/** Горячая линия экстренной помощи (РФ). */
export const EMERGENCY_PHONE = "112";

/**
 * Кризисные контакты для взрослых. Проверено по официальным источникам
 * 19.11.2026 (см. docs/reports/legal-check-2026-11-19.md). Перед запуском
 * перепроверить номера и часы. Детские линии (8 800 2000-122, 8 800 707-02-01)
 * для взрослых не использовать.
 */
export const CRISIS_CONTACTS = [
  {
    phone: "112",
    tel: "112",
    label: "Единый номер экстренных служб",
    note: "Если есть непосредственная угроза жизни",
  },
  {
    phone: "8 (495) 989-50-50",
    tel: "+74959895050",
    label: "Психологическая помощь МЧС России",
    note: "Круглосуточно, анонимно, бесплатно",
  },
  {
    phone: "8 800 250-18-59",
    tel: "+78002501859",
    label: "Психологическая поддержка Российского Красного Креста",
    note: "Бесплатно, анонимно",
  },
] as const;

/** Дата проверки кризисных контактов. */
export const CRISIS_CONTACTS_VERIFIED_AT = "2026-11-19";

export const ROUTES = {
  landing: "/",
  onboarding: "/onboarding",
  auth: "/auth",
  app: "/app",
  appChat: "/app/chat",
  appDiary: "/app/diary",
  appProgram: "/app/program",
  appSettings: "/app/settings",
  paywall: "/paywall",
  legal: {
    terms: "/legal/terms",
    privacy: "/legal/privacy",
    offer: "/legal/offer",
    consent: "/legal/consent",
  },
} as const;

/** Лимиты rate limit (in-memory на Phase 1, Redis — позже; 12-tech-plan §11). */
export const RATE_LIMITS = {
  magicLinkPerIp: { limit: 5, windowMs: 60_000 },
  verifyPerIp: { limit: 20, windowMs: 60_000 },
} as const;
