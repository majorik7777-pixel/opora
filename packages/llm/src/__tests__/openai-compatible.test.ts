import { createServer, type Server } from "node:http";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createLlmProvider, OpenAiCompatibleProvider } from "../index";

let server: Server;
let baseUrl: string;

beforeAll(async () => {
  server = createServer((request, response) => {
    if (request.url?.endsWith("/chat/completions")) {
      response.writeHead(200, { "Content-Type": "text/event-stream" });
      response.write('data: {"choices":[{"delta":{"content":"Ты "}}]}\n\n');
      response.write('data: {"choices":[{"delta":{"content":"не одна."}}]}\n\n');
      response.write("data: [DONE]\n\n");
      response.end();
      return;
    }
    response.writeHead(404);
    response.end();
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("Не удалось поднять тестовый сервер");
  }
  baseUrl = `http://127.0.0.1:${address.port}/v1`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

describe("OpenAI-совместимый провайдер", () => {
  it("стримит SSE-ответ", async () => {
    const provider = createLlmProvider("openai-compatible", {
      apiKey: "test-key",
      baseUrl,
      model: "test/model",
    });

    let text = "";
    for await (const chunk of provider.chat({
      messages: [{ role: "user", content: "Привет" }],
    })) {
      text += chunk.delta;
    }

    expect(text).toContain("Ты");
    expect(text).toContain("не одна.");
  });

  it("требует ключ, base URL и модель", () => {
    expect(
      () =>
        new OpenAiCompatibleProvider({
          apiKey: "",
          baseUrl: "https://openrouter.ai/api/v1",
          model: "x",
        }),
    ).toThrow(/LLM_API_KEY/);

    expect(
      () =>
        new OpenAiCompatibleProvider({
          apiKey: "k",
          baseUrl: "https://openrouter.ai/api/v1",
          model: "",
        }),
    ).toThrow(/LLM_MODEL/);
  });

  it("кризисная классификация работает без сети", async () => {
    const provider = new OpenAiCompatibleProvider({
      apiKey: "k",
      baseUrl,
      model: "test/model",
    });
    const verdict = await provider.moderate("Не хочу жить");
    expect(verdict.flagged).toBe(true);
    expect(verdict.categories).toContain("self_harm");
  });
});
