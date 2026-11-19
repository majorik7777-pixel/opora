import { describe, expect, it } from "vitest";
import { CHAT_SYSTEM_PROMPT_V1, createLlmProvider, FakeLlmProvider } from "../index";

describe("LLM fake-провайдер", () => {
  it("стримит непустой ответ", async () => {
    const provider = createLlmProvider("fake");
    expect(provider.id).toBe("fake");

    let text = "";
    for await (const chunk of provider.chat({
      messages: [{ role: "user", content: "Мне очень плохо" }],
    })) {
      text += chunk.delta;
    }

    expect(text.trim().length).toBeGreaterThan(20);
    expect(text).toContain("?");
  });

  it("возвращает эмбеддинги нужной формы", async () => {
    const provider = new FakeLlmProvider();
    const vectors = await provider.embed(["а", "б"]);
    expect(vectors).toHaveLength(2);
    expect(vectors[0]).toHaveLength(8);
  });

  it("помечает кризисные фразы и не трогает нейтральные", async () => {
    const provider = new FakeLlmProvider();

    const crisis = await provider.moderate("Я не хочу жить, всё бессмысленно");
    expect(crisis.flagged).toBe(true);
    expect(crisis.categories).toContain("self_harm");

    const neutral = await provider.moderate("Мне грустно после расставания");
    expect(neutral.flagged).toBe(false);
  });

  it("системный промпт запрещает медицинские обещания", () => {
    expect(CHAT_SYSTEM_PROMPT_V1).toContain("Не ставь диагнозы");
    expect(CHAT_SYSTEM_PROMPT_V1).toContain("назначай лечение");
  });

  it("неизвестный провайдер падает с понятной ошибкой", () => {
    expect(() => createLlmProvider("yandex")).toThrow(/не реализован/);
  });
});
