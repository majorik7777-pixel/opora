import { describe, expect, it } from "vitest";
import { MIGRATIONS } from "../migrations";
import { countRows, createTestDatabase } from "../testing";
import {
  findOrCreateUser,
  findSessionUser,
  findUserByEmailHmac,
  createSession,
} from "../repositories/auth";
import { findOnboardingAnswers, saveOnboardingBundle } from "../repositories/onboarding";
import { findProgramBySlug, listPrograms, upsertProgram } from "../repositories/programs";
import { uuidv7 } from "@opora/shared/server";
import { chatThreads } from "../schema";

describe("БД: миграции и репозитории", () => {
  it("миграции применяются идемпотентно", async () => {
    const handle = await createTestDatabase();
    try {
      // Число применённых миграций должно совпадать с их списком и не расти
      // при повторном прогоне (идемпотентность).
      const total = MIGRATIONS.length;
      expect(await countRows(handle, "_opora_migrations")).toBe(total);
      const { runMigrations } = await import("../migrations");
      await runMigrations(handle.db);
      expect(await countRows(handle, "_opora_migrations")).toBe(total);
      expect(await countRows(handle, "users")).toBe(0);
    } finally {
      await handle.close();
    }
  });

  it("находит или создаёт пользователя по HMAC email (уникальность)", async () => {
    const handle = await createTestDatabase();
    try {
      const emailHmac = "hmac-abc";
      const first = await findOrCreateUser(handle.db, {
        id: uuidv7(),
        emailEnc: "enc-1",
        emailHmac,
      });
      const second = await findOrCreateUser(handle.db, {
        id: uuidv7(),
        emailEnc: "enc-1",
        emailHmac,
      });

      expect(second.id).toBe(first.id);
      expect(await countRows(handle, "users")).toBe(1);

      const found = await findUserByEmailHmac(handle.db, emailHmac);
      expect(found?.id).toBe(first.id);
    } finally {
      await handle.close();
    }
  });

  it("сохраняет онбординг-бандл и находит активную сессию", async () => {
    const handle = await createTestDatabase();
    try {
      const user = await findOrCreateUser(handle.db, {
        id: uuidv7(),
        emailEnc: "enc-user",
        emailHmac: "hmac-user",
      });

      const completedAt = new Date();
      await saveOnboardingBundle(handle.db, {
        answers: {
          id: uuidv7(),
          userId: user.id,
          answersEnc: "enc-answers",
          version: "2026-11-19",
          completedAt,
        },
        consents: [
          {
            id: uuidv7(),
            userId: user.id,
            kind: "processing",
            version: "2026-11-19",
            acceptedAt: completedAt,
            ipHash: null,
          },
          {
            id: uuidv7(),
            userId: user.id,
            kind: "special",
            version: "2026-11-19",
            acceptedAt: completedAt,
            ipHash: null,
          },
        ],
        ageConfirmed: true,
      });

      expect(await countRows(handle, "onboarding_answers")).toBe(1);
      expect(await countRows(handle, "consents")).toBe(2);

      const answers = await findOnboardingAnswers(handle.db, user.id);
      expect(answers?.answersEnc).toBe("enc-answers");

      // Повторное сохранение не дублирует согласия.
      await saveOnboardingBundle(handle.db, {
        answers: {
          id: uuidv7(),
          userId: user.id,
          answersEnc: "enc-answers-v2",
          version: "2026-11-19",
          completedAt: new Date(),
        },
        consents: [
          {
            id: uuidv7(),
            userId: user.id,
            kind: "processing",
            version: "2026-11-19",
            acceptedAt: completedAt,
            ipHash: null,
          },
        ],
        ageConfirmed: true,
      });
      expect(await countRows(handle, "onboarding_answers")).toBe(1);
      expect(await countRows(handle, "consents")).toBe(2);

      const tokenHash = "session-hash-1";
      await createSession(handle.db, {
        id: uuidv7(),
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 60_000),
      });
      const session = await findSessionUser(handle.db, tokenHash);
      expect(session?.user.id).toBe(user.id);
    } finally {
      await handle.close();
    }
  });

  it("каталог программ: миграция сеет первую программу, upsert идемпотентен", async () => {
    const handle = await createTestDatabase();
    try {
      // Миграция 0003 кладёт строку «расставание» — на неё уже ссылаются
      // entitlements и страницы лендинга, поэтому она должна существовать.
      const seeded = await findProgramBySlug(handle.db, "rasstavanie");
      expect(seeded?.status).toBe("published");
      expect(seeded?.priceRub).toBe(990);
      expect(seeded?.contentVersion).toBe("v1");

      const published = await listPrograms(handle.db, { onlyPublished: true });
      expect(published.map((row) => row.slug)).toEqual(["rasstavanie"]);

      // Повторный upsert не создаёт вторую строку, но обновляет поля.
      await upsertProgram(handle.db, {
        id: uuidv7(),
        slug: "rasstavanie",
        title: "После расставания: 7 дней",
        summary: "Обновлённое описание",
        status: "published",
        priceRub: 990,
        contentVersion: "v2",
        sortOrder: 10,
      });
      expect(await countRows(handle, "programs")).toBe(1);
      const updated = await findProgramBySlug(handle.db, "rasstavanie");
      expect(updated?.contentVersion).toBe("v2");
      expect(updated?.title).toBe("После расставания: 7 дней");

      // Черновик не попадает в публичный список.
      await upsertProgram(handle.db, {
        id: uuidv7(),
        slug: "trevoga",
        title: "Тревога",
        status: "draft",
      });
      const onlyPublished = await listPrograms(handle.db, { onlyPublished: true });
      expect(onlyPublished.map((row) => row.slug)).toEqual(["rasstavanie"]);
      expect((await listPrograms(handle.db)).length).toBe(2);
    } finally {
      await handle.close();
    }
  });

  it("тред чата хранит программу как контекст, не создавая второй тред", async () => {
    const handle = await createTestDatabase();
    try {
      const user = await findOrCreateUser(handle.db, {
        id: uuidv7(),
        emailEnc: "enc",
        emailHmac: "hmac-chat-program",
      });
      const threadId = uuidv7();
      await handle.db.insert(chatThreads).values({
        id: threadId,
        userId: user.id,
        programSlug: "rasstavanie",
      });
      const rows = await handle.db.select().from(chatThreads);
      expect(rows).toHaveLength(1);
      expect(rows[0]?.programSlug).toBe("rasstavanie");
    } finally {
      await handle.close();
    }
  });
});
