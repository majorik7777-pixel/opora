import { getCatalogProgram, getPublishedProgram, listCatalogPrograms } from "../catalog";
import { closeDb, ensureDatabaseReady, getDb, upsertProgram } from "@opora/db";
import { uuidv7 } from "@opora/shared/server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.DATABASE_DRIVER = "pglite";
  process.env.PGLITE_DATA_DIR = ":memory:";
  process.env.APP_URL = "http://localhost:3100";
  process.env.AUTH_SECRET = "test-auth-secret-1234567890";
  process.env.ENCRYPTION_KEY = Buffer.alloc(32, 3).toString("base64");
  await ensureDatabaseReady();
});

afterAll(async () => {
  await closeDb();
});

describe("catalog: витрина программ", () => {
  it("находит засеянную программу и не отдаёт черновик как публичную", async () => {
    const seeded = await getCatalogProgram("rasstavanie");
    expect(seeded?.status).toBe("published");
    expect(seeded?.priceRub).toBe(990);

    const db = await getDb();
    await upsertProgram(db, {
      id: uuidv7(),
      slug: "trevoga",
      title: "Тревога",
      status: "draft",
    });

    expect(await getCatalogProgram("trevoga")).not.toBeNull();
    expect(await getPublishedProgram("trevoga")).toBeNull();
    expect(await getCatalogProgram("net-takoy")).toBeNull();
  });

  it("список для публичной витрины содержит только опубликованные", async () => {
    const published = await listCatalogPrograms({ onlyPublished: true });
    expect(published.every((row) => row.status === "published")).toBe(true);
    expect(published.map((row) => row.slug)).toContain("rasstavanie");
    expect(published.map((row) => row.slug)).not.toContain("trevoga");
  });
});
