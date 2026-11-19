import type {
  ChatChunk,
  ChatRequest,
  LlmProvider,
  ModerationResult,
} from "./types";

/**
 * Fake-провайдер: детерминированные ответы без сети.
 * Используется в тестах, dev-режиме и каркасе чата (D-021, 12-tech-plan §6.1).
 */

const CRISIS_PATTERNS: Array<{ category: string; pattern: RegExp }> = [
  {
    category: "self_harm",
    pattern:
      /(суицид|самоубийств|покончить с собой|не хочу жить|не вижу смысла жить|навредить себе|порезать себя|самоповреждени)/iu,
  },
  {
    category: "violence",
    pattern: /(избива|бьёт|бьет|насили|угрожает убить|душит)/iu,
  },
];

const FAKE_REPLY =
  "Похоже, сейчас правда непросто, и это понятно: такие мысли приходят, когда больно. Ты не обязана быть сильной прямо сейчас. Что помогает тебе хотя бы немного — вода, душ, короткая прогулка?";

export class FakeLlmProvider implements LlmProvider {
  readonly id = "fake";

  async *chat(_request: ChatRequest): AsyncIterable<ChatChunk> {
    for (const word of FAKE_REPLY.split(" ")) {
      yield { delta: `${word} ` };
    }
    yield { delta: "", done: true };
  }

  async embed(texts: string[]): Promise<number[][]> {
    return texts.map(() => new Array<number>(8).fill(0));
  }

  async moderate(text: string): Promise<ModerationResult> {
    const categories = CRISIS_PATTERNS.filter(({ pattern }) =>
      pattern.test(text),
    ).map(({ category }) => category);

    return { flagged: categories.length > 0, categories };
  }
}
