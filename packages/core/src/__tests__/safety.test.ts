import { describe, expect, it } from "vitest";
import { CRISIS_SCREEN_COPY, assessRisk } from "../safety";

describe("safety: классификация риска до генерации", () => {
  it("обычное сообщение о расставании — без кризиса", () => {
    const result = assessRisk("Не могу перестать думать о нём, всё напоминает");
    expect(result.level).toBe("none");
    expect(result.requiresCrisisScreen).toBe(false);
  });

  it("угроза жизни останавливает генерацию", () => {
    for (const text of [
      "Я не хочу жить дальше",
      "Думаю покончить с собой",
      "Хочу умереть",
    ]) {
      const result = assessRisk(text);
      expect(result.level).toBe("crisis");
      expect(result.requiresCrisisScreen).toBe(true);
      expect(result.categories).toContain("self_harm");
    }
  });

  it("насилие в отношениях — тоже кризис", () => {
    const result = assessRisk("Он меня избивает и угрожает убить");
    expect(result.level).toBe("crisis");
    expect(result.requiresCrisisScreen).toBe(true);
    expect(result.categories).toContain("violence");
  });

  it("утрата и тяжёлое состояние — elevated, но не стоп", () => {
    const loss = assessRisk("Он умер месяц назад, я не знаю, как жить");
    expect(loss.level).toBe("elevated");
    expect(loss.requiresCrisisScreen).toBe(false);
    expect(loss.categories).toContain("loss");

    const breakdown = assessRisk("Нет сил вообще, всё бессмысленно");
    expect(breakdown.level).toBe("elevated");
    expect(breakdown.requiresCrisisScreen).toBe(false);
  });

  it("текст кризисного экрана не пугает и не обещает лечения", () => {
    expect(CRISIS_SCREEN_COPY.title).toBe("Сейчас важнее другое");
    expect(CRISIS_SCREEN_COPY.lead).not.toMatch(/лечен|терапи|диагноз/i);
    expect(CRISIS_SCREEN_COPY.note).toContain("112");
  });
});
