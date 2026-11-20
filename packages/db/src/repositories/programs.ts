import { asc, eq } from "drizzle-orm";
import type { Db } from "../client";
import { programs } from "../schema";

export type ProgramRow = typeof programs.$inferSelect;

/**
 * Каталог программ (D-035, `docs/product/scalability.md`).
 *
 * Программа — запись каталога, а не отдельное приложение: по `slug` на неё
 * ссылаются доступы (`entitlements`), контекст чата (`chat_threads.program_slug`)
 * и страницы `/programs/[slug]`. Контент программы живёт в `@opora/web/content`,
 * каталог отвечает только за витрину: статус, цену, порядок и версию контента.
 */

export async function listPrograms(
  db: Db,
  options: { onlyPublished?: boolean } = {},
): Promise<ProgramRow[]> {
  const query = db.select().from(programs).orderBy(asc(programs.sortOrder), asc(programs.slug));
  if (!options.onlyPublished) return query;
  return db
    .select()
    .from(programs)
    .where(eq(programs.status, "published"))
    .orderBy(asc(programs.sortOrder), asc(programs.slug));
}

export async function findProgramBySlug(
  db: Db,
  slug: string,
): Promise<ProgramRow | null> {
  const rows = await db
    .select()
    .from(programs)
    .where(eq(programs.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export interface UpsertProgramInput {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  status?: "draft" | "published" | "archived";
  priceRub?: number;
  contentVersion?: string;
  sortOrder?: number;
}

/** Идемпотентная запись программы: миграция сеет базовую строку, код может обновлять. */
export async function upsertProgram(
  db: Db,
  input: UpsertProgramInput,
): Promise<ProgramRow> {
  const now = new Date();
  await db
    .insert(programs)
    .values({
      id: input.id,
      slug: input.slug,
      title: input.title,
      summary: input.summary ?? "",
      status: input.status ?? "draft",
      priceRub: input.priceRub ?? 0,
      contentVersion: input.contentVersion ?? "v1",
      sortOrder: input.sortOrder ?? 0,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: programs.slug,
      set: {
        title: input.title,
        summary: input.summary ?? "",
        status: input.status ?? "draft",
        priceRub: input.priceRub ?? 0,
        contentVersion: input.contentVersion ?? "v1",
        sortOrder: input.sortOrder ?? 0,
        updatedAt: now,
      },
    });

  const row = await findProgramBySlug(db, input.slug);
  if (!row) throw new Error("Не удалось записать программу в каталог");
  return row;
}
