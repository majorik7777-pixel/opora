import { FakeLlmProvider } from "./fake";
import type { LlmProvider } from "./types";

export * from "./fake";
export * from "./prompts/chat-system.v1";
export * from "./types";

/**
 * Реестр провайдеров (12-tech-plan.md §6.1).
 * Phase 1 реализован только fake; production-провайдер РФ подключается в T-101
 * и выбирается по env LLM_PROVIDER.
 */
export function createLlmProvider(kind: string): LlmProvider {
  if (kind === "fake") return new FakeLlmProvider();

  throw new Error(
    `LLM_PROVIDER=${kind} ещё не реализован. Phase 1 работает на fake-провайдере (D-021).`,
  );
}
