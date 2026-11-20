"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { yandexMetrikaGoal } from "@/components/analytics/yandex-metrika";
import {
  ONBOARDING_CONSENT_COPY,
  ONBOARDING_STEPS,
  ROUTES,
  type OnboardingAnswers,
  type OnboardingDraft,
  type OnboardingStepId,
} from "@opora/shared";
import { Button, Checkbox, ProgressBar, RadioCard } from "@opora/ui";
import { submitOnboardingAction } from "@/server/actions/onboarding";

type AnswersDraft = Partial<Record<OnboardingStepId, string>>;

const CONSENT_STEP_INDEX = ONBOARDING_STEPS.length;

export function OnboardingWizard({
  authenticated,
}: {
  authenticated: boolean;
}) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersDraft>({});
  const [consents, setConsents] = useState({
    age: false,
    processing: false,
    special: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const isConsentStep = stepIndex >= CONSENT_STEP_INDEX;
  const step = isConsentStep ? undefined : ONBOARDING_STEPS[stepIndex];
  const currentValue = step ? answers[step.id] : undefined;
  const allConsents = consents.age && consents.processing && consents.special;
  const progress = isConsentStep
    ? 100
    : Math.round(((stepIndex + 1) / (ONBOARDING_STEPS.length + 1)) * 100);

  useEffect(() => {
    // Маркер готовности к интерактиву: до гидрации клик по варианту может
    // потеряться (нативный input переключится, React-состояние — нет).
    // E2E ждут html[data-hydrated="true"] перед кликами.
    document.documentElement.dataset.hydrated = "true";
  }, []);

  useEffect(() => {
    headingRef.current?.focus();
  }, [stepIndex]);

  function selectAnswer(stepId: OnboardingStepId, value: string): void {
    setAnswers((previous) => ({ ...previous, [stepId]: value }));
    setError(null);
  }

  function goNext(): void {
    if (!step) return;

    // Страховка от потерянного первого тапа (клик до гидрации): нативный input
    // уже переключён, а React-состояние — ещё нет. Берём значение из DOM.
    let value = currentValue;
    if (!value) {
      const checked = document.querySelector<HTMLInputElement>(
        `input[name="${step.id}"]:checked`,
      );
      if (checked?.value) {
        value = checked.value;
        selectAnswer(step.id, value);
      }
    }

    if (!value) {
      setError("Выбери, пожалуйста, один из вариантов.");
      return;
    }

    setError(null);
    setStepIndex((index) => Math.min(index + 1, CONSENT_STEP_INDEX));
  }

  function goBack(): void {
    setError(null);
    setStepIndex((index) => Math.max(0, index - 1));
  }

  function toggleConsent(
    key: "age" | "processing" | "special",
    checked: boolean,
  ): void {
    setConsents((previous) => ({ ...previous, [key]: checked }));
    setError(null);
  }

  function submit(): void {
    const collected = {
      situation: answers.situation,
      timing: answers.timing,
      pain: answers.pain,
      goal: answers.goal,
      sleep: answers.sleep,
    };

    if (!allConsents) {
      setError("Подтверди, пожалуйста, все согласия — без них нельзя начать.");
      return;
    }

    if (
      !collected.situation ||
      !collected.timing ||
      !collected.pain ||
      !collected.goal ||
      !collected.sleep
    ) {
      setError("Ответь, пожалуйста, на все вопросы — так поддержка будет точнее.");
      return;
    }

    const draft: OnboardingDraft = {
      // Значения проверены выше; zod на сервере отвалидирует ещё раз.
      answers: collected as OnboardingAnswers,
      consents: {
        age: consents.age,
        processing: consents.processing,
        special: consents.special,
      },
      acceptedAt: new Date().toISOString(),
    };

    startTransition(async () => {
      const result = await submitOnboardingAction(draft);
      if (result.ok) {
        yandexMetrikaGoal("onboarding_complete");
        router.push(result.data.redirectTo);
        return;
      }
      setError(result.message);
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm text-muted">
          {/* Одна строка, а не два span'а: иначе скринридер и innerText склеивают
              «из 5» + «2 минуты» в «из 52 минуты». */}
          <span>
            {isConsentStep
              ? "Последний шаг · 2 минуты"
              : `Вопрос ${stepIndex + 1} из ${ONBOARDING_STEPS.length} · 2 минуты`}
          </span>
        </div>
        <ProgressBar
          value={progress}
          ariaLabel={
            isConsentStep
              ? "Онбординг: осталось подтвердить согласия"
              : `Онбординг: вопрос ${stepIndex + 1} из ${ONBOARDING_STEPS.length}`
          }
        />
      </div>

      {isConsentStep ? (
        <section aria-labelledby="consent-title" className="space-y-5">
          <div>
            <h2
              id="consent-title"
              ref={headingRef}
              tabIndex={-1}
              className="font-sans text-2xl leading-tight text-ink outline-none"
            >
              Перед стартом
            </h2>
            <p className="mt-2 text-base leading-7 text-muted">
              {authenticated
                ? "Ответы сохранятся в твоём аккаунте."
                : "Дальше — вход по почте: пришлём ссылку, пароль не нужен."}
            </p>
          </div>

          <div className="space-y-2">
            <Checkbox
              id="consent-age"
              checked={consents.age}
              onChange={(checked) => toggleConsent("age", checked)}
            >
              {ONBOARDING_CONSENT_COPY.age}
            </Checkbox>
            <Checkbox
              id="consent-processing"
              checked={consents.processing}
              onChange={(checked) => toggleConsent("processing", checked)}
            >
              Согласна с обработкой данных и политикой конфиденциальности.
              Понимаю, что это не медицинская услуга.
            </Checkbox>
            <Checkbox
              id="consent-special"
              checked={consents.special}
              onChange={(checked) => toggleConsent("special", checked)}
            >
              Понимаю, что рассказываю о своём состоянии, и согласна на
              обработку этих данных для работы сервиса.
            </Checkbox>
          </div>

          <p className="text-sm leading-6 text-muted">
            Подробнее:{" "}
            <Link
              href={ROUTES.legal.privacy}
              className="text-accent-deep underline underline-offset-2"
            >
              политика конфиденциальности
            </Link>
            ,{" "}
            <Link
              href={ROUTES.legal.consent}
              className="text-accent-deep underline underline-offset-2"
            >
              согласие на обработку данных
            </Link>
            .
          </p>

          <p className="text-sm leading-6 text-muted">
            Все согласия можно отозвать, а данные — удалить в настройках. Это не
            медицинская услуга: сервис не ставит диагнозы и не назначает
            лечение. 18+.
          </p>

          {error ? (
            <p
              role="alert"
              className="rounded-field border border-danger/30 bg-danger/5 px-4 py-3 text-sm leading-6 text-danger"
            >
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <Button
              size="lg"
              fullWidth
              onClick={submit}
              disabled={!allConsents || isPending}
              aria-busy={isPending}
            >
              {isPending ? "Сохраняем…" : "Начать"}
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={goBack}
              disabled={isPending}
            >
              Назад
            </Button>
          </div>
        </section>
      ) : step ? (
        <section aria-labelledby="step-title" className="space-y-5">
          <h2
            id="step-title"
            ref={headingRef}
            tabIndex={-1}
            className="font-sans text-2xl leading-tight text-ink outline-none sm:text-3xl"
          >
            {step.question}
          </h2>

          <fieldset aria-labelledby="step-title" className="space-y-2">
            <legend className="sr-only">{step.question}</legend>
            {step.options.map((option) => (
              <RadioCard
                key={option.value}
                name={step.id}
                value={option.value}
                label={option.label}
                checked={currentValue === option.value}
                onChange={(value) => selectAnswer(step.id, value)}
              />
            ))}
          </fieldset>

          {error ? (
            <p role="alert" className="text-sm leading-6 text-danger">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row-reverse">
            <Button
              size="lg"
              fullWidth
              onClick={goNext}
              disabled={isPending}
            >
              Дальше
            </Button>
            {stepIndex > 0 ? (
              <Button variant="ghost" size="lg" onClick={goBack}>
                Назад
              </Button>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
