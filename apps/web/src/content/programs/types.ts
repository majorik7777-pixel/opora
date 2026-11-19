export interface ProgramPreview {
  chat: {
    title: string;
    messages: { role: "user" | "assistant"; text: string }[];
    caption: string;
  };
  day: {
    label: string;
    title: string;
    minutes: string;
    progress: string;
    cta: string;
  };
  diary: {
    label: string;
    mood: string;
    title: string;
    text: string;
    cta: string;
  };
}

export interface ProgramContent {
  slug: string;
  name: string;
  shortName: string;
  headline: string;
  subhead: string;
  heroNote: string;
  heroStats: { value: string; label: string }[];
  pains: { label: string; text: string }[];
  sevenDays: { period: string; days: string; title: string; text: string }[];
  dayTitles: string[];
  inside: { title: string; text: string }[];
  preview: ProgramPreview;
  pricing: {
    price: string;
    priceNote: string;
    includes: { title: string; text: string }[];
    guarantee: string;
    paymentNote: string;
  };
  faq: { question: string; answer: string }[];
}

export type { ProgramContent as Program };
