import { z } from "zod";

/**
 * Контракт дневника (T-102, docs/specs/diary.md).
 * Настроение обязательно (1–10), текст опционален, теги — из фиксированного списка.
 */

export const DIARY_TEXT_MAX_LENGTH = 5000;

export const DIARY_TAGS = [
  { value: "relationships", label: "Отношения" },
  { value: "work", label: "Работа" },
  { value: "body", label: "Тело" },
  { value: "sleep", label: "Сон" },
  { value: "family", label: "Семья" },
  { value: "other", label: "Другое" },
] as const;

export type DiaryTag = (typeof DIARY_TAGS)[number]["value"];

export const DIARY_TAG_VALUES = DIARY_TAGS.map((tag) => tag.value) as [
  DiaryTag,
  ...DiaryTag[],
];

export const MOOD_MIN = 1;
export const MOOD_MAX = 10;

export const diaryEntryInputSchema = z.object({
  mood: z
    .number()
    .int("Настроение — целое число")
    .min(MOOD_MIN, "Настроение от 1 до 10")
    .max(MOOD_MAX, "Настроение от 1 до 10"),
  text: z
    .string()
    .trim()
    .max(DIARY_TEXT_MAX_LENGTH, `Не больше ${DIARY_TEXT_MAX_LENGTH} символов`)
    .optional()
    .default(""),
  tags: z.array(z.enum(DIARY_TAG_VALUES)).max(DIARY_TAGS.length).default([]),
  /** Дата записи (yyyy-mm-dd), по умолчанию — сегодня на сервере. */
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Дата в формате YYYY-MM-DD")
    .optional(),
});

export type DiaryEntryInput = z.infer<typeof diaryEntryInputSchema>;

export interface DiaryEntryView {
  id: string;
  /** yyyy-mm-dd */
  date: string;
  mood: number;
  text: string;
  tags: DiaryTag[];
  createdAt: string;
}

export interface DiaryFeed {
  entries: DiaryEntryView[];
  /** Среднее настроение за показанный период (null, если записей нет). */
  averageMood: number | null;
}

export function diaryTagLabel(tag: string): string {
  return DIARY_TAGS.find((item) => item.value === tag)?.label ?? tag;
}

/** Цвет «настроения» для UI: не оценка, а спокойная шкала от тяжёлого к лёгкому. */
export function moodTone(mood: number): "low" | "mid" | "high" {
  if (mood <= 3) return "low";
  if (mood <= 6) return "mid";
  return "high";
}
