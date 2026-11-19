import { describe, expect, it } from "vitest";
import { openJson, openText, sealJson, sealText, sha256Hex, randomToken, hashEmail, uuidv7, getEncryptionKey } from "../server";

process.env.AUTH_SECRET = "test-auth-secret-for-shared-crypto";
process.env.ENCRYPTION_KEY = Buffer.alloc(32, 9).toString("base64");

describe("крипто-утилиты", () => {
  it("ENCRYPTION_KEY валидируется как 32 байта", () => {
    expect(getEncryptionKey()).toHaveLength(32);

    const original = process.env.ENCRYPTION_KEY;
    process.env.ENCRYPTION_KEY = Buffer.from("short").toString("base64");
    expect(() => getEncryptionKey()).toThrow(/32 байта/);
    process.env.ENCRYPTION_KEY = original;
  });

  it("seal/open JSON: roundtrip и защита от подмены", () => {
    const payload = { situation: "breakup", nested: { pain: "guilt" } };
    const token = sealJson(payload);
    expect(openJson<typeof payload>(token)).toEqual(payload);

    const tampered = token.slice(0, -2) + (token.endsWith("AA") ? "BB" : "AA");
    expect(() => openJson(tampered)).toThrow();
  });

  it("seal/open текста: email не хранится в открытом виде", () => {
    const email = "user@example.com";
    const sealed = sealText(email);
    expect(sealed).not.toContain(email);
    expect(openText(sealed)).toBe(email);
  });

  it("hashEmail стабилен и не зависит от регистра", () => {
    expect(hashEmail("User@Example.COM")).toBe(hashEmail(" user@example.com "));
    expect(hashEmail("a@example.com")).not.toBe(hashEmail("b@example.com"));
  });

  it("sha256Hex и randomToken дают стабильные форматы", () => {
    expect(sha256Hex("abc")).toMatch(/^[0-9a-f]{64}$/);
    const token = randomToken();
    expect(token.length).toBeGreaterThanOrEqual(40);
    expect(token).not.toBe(randomToken());
  });

  it("uuidv7: версия 7, вариант RFC и монотонность по времени", () => {
    const early = uuidv7(1_700_000_000_000);
    const late = uuidv7(1_800_000_000_000);
    expect(early).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(early < late).toBe(true);
  });
});
