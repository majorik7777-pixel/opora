import { moderateText } from "@opora/llm";

/**
 * Safety-слой «Опоры» (T-105, docs/specs/safety.md).
 *
 * Задача: до генерации понять, что человеку нужна не программа и не AI-ответ,
 * а человек и экстренная помощь. Три уровня:
 * - `none` — обычный разговор;
 * - `elevated` — тяжёлое состояние/утрата: отвечаем бережно и предлагаем контакты
 *   (D-006: темы смерти и утраты — стоп-сценарий для программы, но не отказ);
 * - `crisis` — риск для жизни/насилие: генерация останавливается, показывается
 *   кризисный экран с телефонами.
 */

export type RiskLevel = "none" | "elevated" | "crisis";

export interface RiskAssessment {
  level: RiskLevel;
  categories: string[];
  /** Нужно ли останавливать обычную генерацию и показывать кризисный экран. */
  requiresCrisisScreen: boolean;
}

const CRISIS_PATTERNS: Array<{ category: string; pattern: RegExp }> = [
  {
    category: "self_harm",
    pattern:
      /(суицид|самоубийств|покончить с собой|не хочу жить|не вижу смысла жить|навредить себе|порезать себя|самоповреждени|убить себя|хочу умереть|лучше бы меня не было)/iu,
  },
  {
    category: "violence",
    pattern:
      /(избива|бьёт|бьет|насили|угрожает убить|душит|причинить вред|боюсь его|запирает|не выпускает)/iu,
  },
];

const ELEVATED_PATTERNS: Array<{ category: string; pattern: RegExp }> = [
  {
    category: "loss",
    pattern:
      /(он умер|она умерла|погиб|похорон|смерть|умер близкий|не вернулся)/iu,
  },
  {
    category: "breakdown",
    pattern:
      /(не могу больше|нет сил вообще|всё бессмысленно|не вижу выхода|срываюсь|паническая атака)/iu,
  },
];

/** Классификация до генерации. Без сети и без моделей — предсказуемо в тестах. */
export function assessRisk(text: string): RiskAssessment {
  const moderation = moderateText(text);
  const categories = new Set(moderation.categories);

  for (const { category, pattern } of CRISIS_PATTERNS) {
    if (pattern.test(text)) categories.add(category);
  }

  const crisis = CRISIS_PATTERNS.some(({ pattern }) => pattern.test(text));
  if (crisis) {
    return {
      level: "crisis",
      categories: [...categories],
      requiresCrisisScreen: true,
    };
  }

  for (const { category, pattern } of ELEVATED_PATTERNS) {
    if (pattern.test(text)) categories.add(category);
  }

  const elevated = ELEVATED_PATTERNS.some(({ pattern }) => pattern.test(text));
  return {
    level: elevated ? "elevated" : "none",
    categories: [...categories],
    requiresCrisisScreen: false,
  };
}

/** Текст кризисного экрана: спокойно, без запугивания, с конкретными номерами. */
export const CRISIS_SCREEN_COPY = {
  title: "Сейчас важнее другое",
  lead: "Похоже, тебе очень тяжело. Пожалуйста, свяжись с человеком, который может быть рядом, и с одним из номеров ниже — это бесплатно и анонимно. Программа и чат подождут.",
  note: "Если есть непосредственная угроза жизни — звони 112.",
} as const;
