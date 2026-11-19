import { z } from "zod";

/** Email: нормализуем и проверяем без экзотики — минимум ложных отказов. */
export const emailSchema = z
  .string()
  .trim()
  .min(3, "Укажи почту")
  .max(254, "Слишком длинный адрес")
  .transform((value) => value.toLowerCase())
  .pipe(
    z
      .string()
      .regex(
        /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/,
        "Похоже, в адресе опечатка",
      ),
  );

export type Email = z.infer<typeof emailSchema>;

export const magicLinkRequestSchema = z.object({
  email: emailSchema,
});

/** Черновик онбординга до входа: 5 ответов + согласия. */
export const consentFlagsSchema = z
  .object({
    age: z.boolean(),
    processing: z.boolean(),
    special: z.boolean(),
  })
  .refine((flags) => flags.age && flags.processing && flags.special, {
    message: "Для старта нужно подтвердить все согласия",
  });

export type ConsentFlags = z.infer<typeof consentFlagsSchema>;

export const consentKindSchema = z.enum([
  "processing",
  "special",
  "cross_border",
  "marketing",
]);

export type ConsentKind = z.infer<typeof consentKindSchema>;

export type UserStatus = "active" | "blocked" | "deleted";

/** Текущий пользователь, как его видит веб-слой (email расшифрован в памяти). */
export interface CurrentUser {
  id: string;
  email: string;
  status: UserStatus;
  ageConfirmed: boolean;
  hasCompletedOnboarding: boolean;
  createdAt: string;
}

/** Профиль онбординга для приветствия в /app. */
export interface OnboardingProfile {
  answers: import("./onboarding").OnboardingAnswers;
  completedAt: string;
}
