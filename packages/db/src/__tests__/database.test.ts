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
import { uuidv7 } from "@opora/shared/server";

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
});
