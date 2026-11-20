import { findProgramBySlug, getDb, listPrograms, type ProgramRow } from "@opora/db";

/**
 * Каталог программ на уровне домена (D-035, И-6/И-7).
 *
 * Витрина читает программу из БД, а не из хардкода: цена, статус и версия
 * контента меняются записью в каталоге. Тексты самой программы живут в
 * `apps/web/src/content/programs` — каталог отвечает за доступность и порядок,
 * контент отвечает за смысл.
 */

export async function getCatalogProgram(slug: string): Promise<ProgramRow | null> {
  const db = await getDb();
  return findProgramBySlug(db, slug);
}

export async function listCatalogPrograms(
  options: { onlyPublished?: boolean } = {},
): Promise<ProgramRow[]> {
  const db = await getDb();
  return listPrograms(db, options);
}

/** Программа доступна публично только если она есть в каталоге и опубликована. */
export async function getPublishedProgram(slug: string): Promise<ProgramRow | null> {
  const program = await getCatalogProgram(slug);
  return program && program.status === "published" ? program : null;
}
