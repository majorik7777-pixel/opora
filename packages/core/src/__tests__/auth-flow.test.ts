import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { closeDb, ensureDatabaseReady, getDb } from "@opora/db";
import { openJson, openText } from "@opora/shared/server";
import { getSessionUser, logout, requestMagicLink, verifyMagicLink } from "../auth";
import { getOnboardingProfile, saveOnboarding } from "../onboarding";
import { resetRateLimits } from "../rate-limit";
import { findOnboardingAnswers, findUserById } from "@opora/db";
import type { OnboardingDraft } from "@opora/shared";

const emailCounter = { value: 0 };

function nextEmail(): string {
  emailCounter.value += 1;
  return `test-${emailCounter.value}@example.com`;
}

const draft: OnboardingDraft = {
  answers: {
    situation: "breakup",
    timing: "1_4_weeks",
    pain: "cant_let_go",
    goal: "stop_thinking",
    sleep: "hard_fall_asleep",
  },
  consents: { age: true, processing: true, special: true },
  acceptedAt: "2026-11-19T10:00:00.000Z",
};

function extractToken(link: string): string {
  const url = new URL(link);
  const token = url.searchParams.get("token");
  if (!token) throw new Error("В devLink нет token");
  return token;
}

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.DATABASE_DRIVER = "pglite";
  process.env.PGLITE_DATA_DIR = ":memory:";
  process.env.APP_URL = "http://localhost:3100";
  process.env.AUTH_SECRET = "test-auth-secret-1234567890";
  process.env.ENCRYPTION_KEY = Buffer.alloc(32, 5).toString("base64");
  process.env.AUTH_DEV_SHOW_LINK = "true";
  process.env.EMAIL_TRANSPORT = "console";
  await ensureDatabaseReady();
});

beforeEach(() => {
  resetRateLimits();
});

afterAll(async () => {
  await closeDb();
});

describe("auth: magic link и сессии", () => {
  it("валидирует email", async () => {
    const result = await requestMagicLink({ email: "не-почта" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("VALIDATION");
  });

  it("полный путь: magic link → сессия → онбординг → главная", async () => {
    const email = nextEmail();
    const requested = await requestMagicLink({
      email: email.toUpperCase(),
      ipHash: "ip-1",
    });
    expect(requested.ok).toBe(true);
    if (!requested.ok) return;
    expect(requested.data.devLink).toBeTruthy();

    const verified = await verifyMagicLink(
      extractToken(requested.data.devLink ?? ""),
      { ipHash: "ip-1" },
    );
    expect(verified.ok).toBe(true);
    if (!verified.ok) return;

    expect(verified.data.user.email).toBe(email);
    expect(verified.data.user.hasCompletedOnboarding).toBe(false);

    const sessionUser = await getSessionUser(verified.data.sessionToken);
    expect(sessionUser?.id).toBe(verified.data.user.id);

    const saved = await saveOnboarding(verified.data.user.id, draft, {
      ipHash: "ip-1",
    });
    expect(saved.ok).toBe(true);

    const afterOnboarding = await getSessionUser(verified.data.sessionToken);
    expect(afterOnboarding?.hasCompletedOnboarding).toBe(true);
    expect(afterOnboarding?.ageConfirmed).toBe(true);

    const profile = await getOnboardingProfile(verified.data.user.id);
    expect(profile?.answers.situation).toBe("breakup");
    expect(profile?.answers.pain).toBe("cant_let_go");
  });

  it("не принимает невалидный черновик онбординга", async () => {
    const email = nextEmail();
    const requested = await requestMagicLink({ email, ipHash: "ip-invalid" });
    if (!requested.ok) throw new Error("запрос не удался");
    const verified = await verifyMagicLink(
      extractToken(requested.data.devLink ?? ""),
    );
    if (!verified.ok) throw new Error("вход не удался");

    const result = await saveOnboarding(verified.data.user.id, {
      answers: { situation: "breakup" },
      consents: draft.consents,
      acceptedAt: draft.acceptedAt,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("VALIDATION");
  });

  it("magic-link одноразовый", async () => {
    const email = nextEmail();
    const requested = await requestMagicLink({ email, ipHash: "ip-single" });
    if (!requested.ok) throw new Error("запрос не удался");
    const token = extractToken(requested.data.devLink ?? "");

    const first = await verifyMagicLink(token);
    expect(first.ok).toBe(true);

    const second = await verifyMagicLink(token);
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.code).toBe("AUTH_INVALID");
  });

  it("magic-link истекает через 20 минут", async () => {
    const email = nextEmail();
    const requested = await requestMagicLink({
      email,
      ipHash: "ip-expire",
    });
    if (!requested.ok) throw new Error("запрос не удался");
    const token = extractToken(requested.data.devLink ?? "");

    const pgliteExpired = await verifyMagicLink(token, {
      now: new Date(Date.now() + 21 * 60_000),
    });
    expect(pgliteExpired.ok).toBe(false);
  });

  it("logout отзывает сессию", async () => {
    const email = nextEmail();
    const requested = await requestMagicLink({ email, ipHash: "ip-logout" });
    if (!requested.ok) throw new Error("запрос не удался");
    const verified = await verifyMagicLink(
      extractToken(requested.data.devLink ?? ""),
    );
    if (!verified.ok) throw new Error("вход не удался");

    await logout(verified.data.sessionToken);
    expect(await getSessionUser(verified.data.sessionToken)).toBeNull();
  });

  it("держит rate limit на запрос ссылок", async () => {
    const email = nextEmail();
    let last: Awaited<ReturnType<typeof requestMagicLink>> | undefined;
    for (let attempt = 0; attempt < 6; attempt += 1) {
      last = await requestMagicLink({ email, ipHash: "ip-rate" });
    }
    expect(last?.ok).toBe(false);
    if (last && !last.ok) expect(last.code).toBe("RATE_LIMITED");
  });
});

describe("данные", () => {
  it("email и ответы онбординга хранятся зашифрованными, согласия — отдельными строками", async () => {
    const email = nextEmail();
    const requested = await requestMagicLink({ email, ipHash: "ip-enc" });
    if (!requested.ok) throw new Error("запрос не удался");
    const verified = await verifyMagicLink(
      extractToken(requested.data.devLink ?? ""),
    );
    if (!verified.ok) throw new Error("вход не удался");

    const db = await getDb();
    const row = await findUserById(db, verified.data.user.id);
    expect(row).toBeTruthy();
    expect(row?.emailEnc).not.toContain(email);
    expect(openText(row?.emailEnc ?? "")).toBe(email);

    await saveOnboarding(verified.data.user.id, draft, { ipHash: "ip-enc" });
    const profile = await getOnboardingProfile(verified.data.user.id);
    expect(profile).toBeTruthy();

    const answersRow = await findOnboardingAnswers(db, verified.data.user.id);
    expect(answersRow?.answersEnc).not.toContain("breakup");
    expect(openJson(answersRow?.answersEnc ?? "")).toMatchObject({
      situation: "breakup",
    });
  });
});
