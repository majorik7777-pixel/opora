import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { closeDb, ensureDatabaseReady, getDb, listEntitlements, users } from "@opora/db";
import { hashEmail, sealText, uuidv7 } from "@opora/shared/server";
import { getProgramAccess, startDevPurchase } from "../billing";

let counter = 0;

async function createUser(): Promise<string> {
  counter += 1;
  const id = uuidv7();
  const email = `billing-${counter}-${Date.now()}@example.com`;
  const db = await getDb();
  await db.insert(users).values({
    id,
    emailEnc: sealText(email),
    emailHmac: hashEmail(email),
    ageConfirmed: true,
  });
  return id;
}

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.DATABASE_DRIVER = "pglite";
  process.env.PGLITE_DATA_DIR = ":memory:";
  process.env.APP_URL = "http://localhost:3100";
  process.env.AUTH_SECRET = "test-auth-secret-1234567890";
  process.env.ENCRYPTION_KEY = Buffer.alloc(32, 3).toString("base64");
  process.env.PAYMENTS_MODE = "dev";
  await ensureDatabaseReady();
});

afterAll(async () => {
  await closeDb();
});

describe("billing: DEV-доступ к программе", () => {
  it("до покупки доступа нет, после — есть", async () => {
    const userId = await createUser();
    expect((await getProgramAccess(userId, "rasstavanie")).active).toBe(false);

    const purchase = await startDevPurchase(userId, "rasstavanie");
    expect(purchase.ok).toBe(true);
    if (!purchase.ok) return;
    expect(purchase.data.price).toBe(990);

    const access = await getProgramAccess(userId, "rasstavanie");
    expect(access.active).toBe(true);
    expect(access.entitlement?.source).toBe("dev");
  });

  it("повторная покупка идемпотентна — одна строка", async () => {
    const userId = await createUser();
    await startDevPurchase(userId, "rasstavanie");
    await startDevPurchase(userId, "rasstavanie");

    expect(await listEntitlements(await getDb(), userId)).toHaveLength(1);
  });

  it("в режиме off доступ не выдаётся", async () => {
    const userId = await createUser();
    process.env.PAYMENTS_MODE = "off";
    try {
      const purchase = await startDevPurchase(userId, "rasstavanie");
      expect(purchase.ok).toBe(false);
      if (!purchase.ok) expect(purchase.code).toBe("CONFLICT");
      expect((await getProgramAccess(userId, "rasstavanie")).active).toBe(false);
      expect(await listEntitlements(await getDb(), userId)).toHaveLength(0);
    } finally {
      process.env.PAYMENTS_MODE = "dev";
    }
  });
});
