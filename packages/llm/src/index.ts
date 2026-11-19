import { FakeLlmProvider } from "./fake";
import { OpenAiCompatibleProvider } from "./openai-compatible";
import type { LlmProvider } from "./types";

export * from "./fake";
export * from "./openai-compatible";
export * from "./prompts/chat-system.v1";
export * from "./safety";
export * from "./types";

export interface LlmProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  headers?: Record<string, string>;
}

/**
 * Реестр провайдеров (12-tech-plan.md §6.1, ADR-0004):
 * - fake — тесты и dev по умолчанию;
 * - openai-compatible — любой OpenAI-совместимый API (OpenRouter, OpenAI,
 *   DeepSeek, Groq, локальный vLLM) для работы и тестов;
 * - yandex / gigachat / cloudru — production-контур РФ (T-101).
 */
export function createLlmProvider(
  kind: string,
  config: LlmProviderConfig = {},
): LlmProvider {
  if (kind === "fake") return new FakeLlmProvider();

  if (kind === "openai-compatible" || kind === "openrouter" || kind === "openai") {
    return new OpenAiCompatibleProvider({
      apiKey: config.apiKey ?? "",
      baseUrl: config.baseUrl ?? "https://openrouter.ai/api/v1",
      model: config.model ?? "",
      headers: config.headers,
    });
  }

  throw new Error(
    `LLM_PROVIDER=${kind} ещё не реализован. Доступно: fake, openai-compatible (OpenRouter/OpenAI-совместимые). ` +
      "YandexGPT/GigaChat подключаются в T-101 (D-021, D-031).",
  );
}
