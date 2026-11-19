import { describe, expect, it } from "vitest";
import {
  ONBOARDING_STEPS,
  getOnboardingLabel,
  onboardingAnswersSchema,
  onboardingDraftSchema,
} from "../index";

const validAnswers = {
  situation: "breakup",
  timing: "1_4_weeks",
  pain: "cant_let_go",
  goal: "stop_thinking",
  sleep: "hard_fall_asleep",
} as const;

describe("схема онбординга", () => {
  it("содержит 5 шагов ровно по полям ответов", () => {
    expect(ONBOARDING_STEPS).toHaveLength(5);
    const ids = ONBOARDING_STEPS.map((step) => step.id).sort();
    expect(ids).toEqual(
      ["goal", "pain", "situation", "sleep", "timing"].sort(),
    );
    for (const step of ONBOARDING_STEPS) {
      expect(step.options.length).toBeGreaterThanOrEqual(3);
      expect(step.question.length).toBeGreaterThan(0);
    }
  });

  it("принимает валидные ответы", () => {
    expect(onboardingAnswersSchema.safeParse(validAnswers).success).toBe(true);
  });

  it("отклоняет неизвестные значения и неполные ответы", () => {
    expect(
      onboardingAnswersSchema.safeParse({ ...validAnswers, pain: "unknown" })
        .success,
    ).toBe(false);
    expect(
      onboardingAnswersSchema.safeParse({ situation: "breakup" }).success,
    ).toBe(false);
  });

  it("черновик требует все три согласия", () => {
    const draft = {
      answers: validAnswers,
      consents: { age: true, processing: true, special: true },
      acceptedAt: "2026-11-19T10:00:00.000Z",
    };
    expect(onboardingDraftSchema.safeParse(draft).success).toBe(true);
    expect(
      onboardingDraftSchema.safeParse({
        ...draft,
        consents: { age: false, processing: true, special: true },
      }).success,
    ).toBe(false);
  });

  it("отдаёт человекочитаемые подписи", () => {
    expect(getOnboardingLabel("situation", "breakup")).toBe("Расстались");
    expect(getOnboardingLabel("sleep", "almost_none")).toBe("Почти не сплю");
    expect(getOnboardingLabel("pain", "nope")).toBe("nope");
  });
});
