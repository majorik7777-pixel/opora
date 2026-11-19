import { moderateText } from "./safety";
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
    return moderateText(text);
  }
}
