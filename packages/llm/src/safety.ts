/**
 * Быстрые правила кризисной классификации (12-tech-plan.md §7).
 * Phase 1: локальный regex-слой. Модельный классификатор — T-105.
 */
const CRISIS_PATTERNS: Array<{ category: string; pattern: RegExp }> = [
  {
    category: "self_harm",
    pattern:
      /(суицид|самоубийств|покончить с собой|не хочу жить|не вижу смысла жить|навредить себе|порезать себя|самоповреждени|убить себя)/iu,
  },
  {
    category: "violence",
    pattern: /(избива|бьёт|бьет|насили|угрожает убить|душит|причинить вред)/iu,
  },
];

export interface ModerationVerdict {
  flagged: boolean;
  categories: string[];
}

/** Локальная проверка текста на кризисные маркеры. */
export function moderateText(text: string): ModerationVerdict {
  const categories = CRISIS_PATTERNS.filter(({ pattern }) =>
    pattern.test(text),
  ).map(({ category }) => category);

  return { flagged: categories.length > 0, categories };
}
