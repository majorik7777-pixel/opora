import type { ProgramContent } from "./types";
import { rasstavanie } from "./rasstavanie";

/**
 * Реестр контента программ. Ключ — `slug`, тот же, что в каталоге БД (`programs.slug`).
 * Новая программа = новый файл контента + строка в каталоге + SEO-кластер,
 * без нового приложения и второго аккаунта (`docs/product/scalability.md`).
 */
export const programContentBySlug: Record<string, ProgramContent> = {
  [rasstavanie.slug]: rasstavanie,
};

export function getProgramContent(slug: string): ProgramContent | null {
  return programContentBySlug[slug] ?? null;
}

export type { ProgramContent };
