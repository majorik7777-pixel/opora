import { randomUUID } from "node:crypto";
import type {
  ChatChunk,
  ChatMessage,
  ChatRequest,
  LlmProvider,
  ModerationResult,
} from "./types";
import { moderateText } from "./safety";

/**
 * Универсальный провайдер для любого OpenAI-совместимого HTTP API:
 * OpenRouter (base URL https://openrouter.ai/api/v1), OpenAI, DeepSeek,
 * Groq, локальные vLLM/Ollama и т.п. Production-контур РФ (YandexGPT,
 * GigaChat) подключается отдельной реализацией в T-101.
 *
 * Секреты и base URL приходят из окружения через фабрику createLlmProvider,
 * сам пакет env не читает (границы слоёв, ADR-0001).
 */
export interface OpenAiCompatibleConfig {
  apiKey: string;
  /** Например https://openrouter.ai/api/v1 или https://opencode.ai/inference/go/openai/v1 */
  baseUrl: string;
  /** Модель, например openai/gpt-4o-mini или deepseek-v4.1-flash */
  model: string;
  /** Доп. заголовки (OpenRouter: HTTP-Referer/X-Title; OpenCode Go: x-opencode-session). */
  headers?: Record<string, string>;
}

interface OpenAiChunk {
  choices?: Array<{
    delta?: { content?: string | null };
    finish_reason?: string | null;
  }>;
}

export class OpenAiCompatibleProvider implements LlmProvider {
  readonly id = "openai-compatible";

  /** Стабильный id сессии для роутинга/кэша (требование OpenCode Go). */
  private readonly sessionId: string;

  constructor(private readonly config: OpenAiCompatibleConfig) {
    this.sessionId = config.headers?.["x-opencode-session"] ?? `ses_${randomUUID()}`;
    if (!config.apiKey) {
      throw new Error(
        "LLM_API_KEY не задан: провайдер openai-compatible требует ключ.",
      );
    }
    if (!config.baseUrl) {
      throw new Error(
        "LLM_BASE_URL не задан: например https://openrouter.ai/api/v1",
      );
    }
    if (!config.model) {
      throw new Error(
        "LLM_MODEL не задан: укажи id модели, например openai/gpt-4o-mini",
      );
    }
  }

  async *chat(request: ChatRequest): AsyncIterable<ChatChunk> {
    const response = await fetch(`${trimSlash(this.config.baseUrl)}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
        "User-Agent": "opora-app/0.1 (contact: dev@opora.local)",
        "x-opencode-session": this.sessionId,
        ...this.config.headers,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: request.messages.map(toApiMessage),
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens,
        stream: true,
      }),
      signal: request.signal,
    });

    if (!response.ok) {
      const details = await safeText(response);
      throw new Error(
        `LLM API ${response.status}: ${details.slice(0, 300) || "без ответа"}`,
      );
    }
    if (!response.body) {
      throw new Error("LLM API: пустой поток ответа, стриминг не поддерживается.");
    }

    const decoder = new TextDecoder();
    let buffer = "";
    const reader = response.body.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex = buffer.indexOf("\n");
        while (newlineIndex >= 0) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);
          newlineIndex = buffer.indexOf("\n");

          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (payload === "[DONE]") {
            yield { delta: "", done: true };
            return;
          }

          const parsed = parseJson<OpenAiChunk>(payload);
          const delta = parsed?.choices?.[0]?.delta?.content;
          if (typeof delta === "string" && delta.length > 0) {
            yield { delta };
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    yield { delta: "", done: true };
  }

  async embed(texts: string[]): Promise<number[][]> {
    const response = await fetch(`${trimSlash(this.config.baseUrl)}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
        "User-Agent": "opora-app/0.1 (contact: dev@opora.local)",
        "x-opencode-session": this.sessionId,
        ...this.config.headers,
      },
      body: JSON.stringify({ model: this.config.model, input: texts }),
    });
    if (!response.ok) {
      throw new Error(`LLM embeddings ${response.status}: ${(await safeText(response)).slice(0, 200)}`);
    }
    const payload = (await response.json()) as {
      data?: Array<{ embedding?: number[] }>;
    };
    return (payload.data ?? []).map((item) => item.embedding ?? []);
  }

  /**
   * Кризисная классификация — локальными правилами. Модельный классификатор
   * подключается в T-105, чтобы не зависеть от поддержки /moderations у
   * разных OpenAI-совместимых провайдеров.
   */
  async moderate(text: string): Promise<ModerationResult> {
    return moderateText(text);
  }
}

function toApiMessage(message: ChatMessage): { role: string; content: string } {
  return { role: message.role, content: message.content };
}

function trimSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function parseJson<T>(value: string): T | undefined {
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

async function safeText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
}
