/** Транспортный интерфейс LLM (12-tech-plan.md §6, ADR-0001). */

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface ChatChunk {
  delta: string;
  done?: boolean;
}

export interface ModerationResult {
  flagged: boolean;
  categories: string[];
}

export interface LlmProvider {
  readonly id: string;
  /** Стриминг ответа. Домены не знают, какой SDK внутри. */
  chat(request: ChatRequest): AsyncIterable<ChatChunk>;
  embed(texts: string[]): Promise<number[][]>;
  moderate(text: string): Promise<ModerationResult>;
}
