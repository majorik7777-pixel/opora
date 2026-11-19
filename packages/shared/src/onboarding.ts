import { z } from "zod";
import { consentFlagsSchema } from "./auth";

/**
 * Вопросы онбординга (11-copy.md §3, 09-product-spec.md §2).
 * Один источник правды для UI-шагов, zod-валидации и сохранения в БД.
 */

export const SITUATION_OPTIONS = [
  { value: "breakup", label: "Расстались" },
  { value: "divorce", label: "Развод" },
  { value: "affair", label: "Измена" },
  { value: "together_ended", label: "Отношения закончились, но мы вместе" },
  { value: "other", label: "Другое" },
] as const;

export const TIMING_OPTIONS = [
  { value: "under_week", label: "Меньше недели" },
  { value: "1_4_weeks", label: "1–4 недели" },
  { value: "1_6_months", label: "1–6 месяцев" },
  { value: "over_6_months", label: "Больше полугода" },
  { value: "over_year", label: "Год и больше" },
] as const;

export const PAIN_OPTIONS = [
  { value: "cant_let_go", label: "Не могу отпустить" },
  { value: "guilt", label: "Чувство вины" },
  { value: "anger", label: "Злость" },
  { value: "emptiness", label: "Пустота" },
  { value: "fear_alone", label: "Страх остаться одной" },
] as const;

export const GOAL_OPTIONS = [
  { value: "stop_thinking", label: "Перестать постоянно думать об этом" },
  { value: "recover_strength", label: "Вернуть себе силы" },
  { value: "understand_next", label: "Понять, что делать дальше" },
  { value: "be_heard", label: "Просто чтобы кто-то выслушал" },
] as const;

export const SLEEP_OPTIONS = [
  { value: "ok", label: "Сплю нормально" },
  { value: "hard_fall_asleep", label: "Засыпаю с трудом" },
  { value: "wake_night", label: "Просыпаюсь ночью" },
  { value: "almost_none", label: "Почти не сплю" },
] as const;

export type Situation = (typeof SITUATION_OPTIONS)[number]["value"];
export type Timing = (typeof TIMING_OPTIONS)[number]["value"];
export type Pain = (typeof PAIN_OPTIONS)[number]["value"];
export type Goal = (typeof GOAL_OPTIONS)[number]["value"];
export type Sleep = (typeof SLEEP_OPTIONS)[number]["value"];

const situationValues = SITUATION_OPTIONS.map((option) => option.value) as [
  Situation,
  ...Situation[],
];
const timingValues = TIMING_OPTIONS.map((option) => option.value) as [
  Timing,
  ...Timing[],
];
const painValues = PAIN_OPTIONS.map((option) => option.value) as [Pain, ...Pain[]];
const goalValues = GOAL_OPTIONS.map((option) => option.value) as [Goal, ...Goal[]];
const sleepValues = SLEEP_OPTIONS.map((option) => option.value) as [Sleep, ...Sleep[]];

export const situationSchema = z.enum(situationValues);
export const timingSchema = z.enum(timingValues);
export const painSchema = z.enum(painValues);
export const goalSchema = z.enum(goalValues);
export const sleepSchema = z.enum(sleepValues);

export const onboardingAnswersSchema = z.object({
  situation: situationSchema,
  timing: timingSchema,
  pain: painSchema,
  goal: goalSchema,
  sleep: sleepSchema,
});

export type OnboardingAnswers = z.infer<typeof onboardingAnswersSchema>;

/**
 * Черновик онбординга, который живёт в зашифрованной cookie до входа
 * (guest-режим): ответы + согласия + момент согласия.
 */
export const onboardingDraftSchema = z.object({
  answers: onboardingAnswersSchema,
  consents: consentFlagsSchema,
  acceptedAt: z.string().min(1),
});

export type OnboardingDraft = z.infer<typeof onboardingDraftSchema>;

/** Экран 1 "Что случилось?" — единственный обязательный вопрос для смысла продукта. */
export type OnboardingStepId = keyof OnboardingAnswers;

export interface OnboardingStepOption {
  value: string;
  label: string;
}

export interface OnboardingStep {
  id: OnboardingStepId;
  /** Короткая подпись шага для прогресса ("Шаг 1 из 5"). */
  question: string;
  /** Пояснение под вопросом (необязательно). */
  hint?: string;
  options: readonly OnboardingStepOption[];
}

export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  {
    id: "situation",
    question: "Что случилось?",
    options: SITUATION_OPTIONS,
  },
  {
    id: "timing",
    question: "Как давно?",
    options: TIMING_OPTIONS,
  },
  {
    id: "pain",
    question: "Что болит сильнее всего?",
    options: PAIN_OPTIONS,
  },
  {
    id: "goal",
    question: "Чего хочется?",
    options: GOAL_OPTIONS,
  },
  {
    id: "sleep",
    question: "Как ты спишь?",
    options: SLEEP_OPTIONS,
  },
] as const;

/** Текст согласий перед стартом (11-copy.md §3). */
export const ONBOARDING_CONSENT_COPY = {
  age: "Мне 18+.",
  processing:
    "Согласна с обработкой моих данных и политикой конфиденциальности. Это не медицинская услуга.",
  special:
    "Понимаю, что рассказываю о своём состоянии, и согласна на обработку этих данных для работы сервиса (ст. 10 152-ФЗ).",
} as const;

/** Возвращает человекочитаемый ответ онбординга (для экрана «что AI помнит» и приветствия). */
export function getOnboardingLabel(
  step: OnboardingStepId,
  value: string,
): string {
  const definition = ONBOARDING_STEPS.find((item) => item.id === step);
  return definition?.options.find((option) => option.value === value)?.label ?? value;
}
