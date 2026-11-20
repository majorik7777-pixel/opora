import { expect, test } from "@playwright/test";
import { waitForHydration } from "./helpers";

const MOBILE = { width: 360, height: 800 };

/** Продукт проектируется с 360 px (10-design.md §6): проверяем отсутствие горизонтального скролла и тач-зоны. */
test.describe("Мобильный 360px", () => {
  test("лендинг: нет горизонтального скролла, CTA крупная", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");

    const widths = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);

    const cta = page.getByRole("link", { name: "Пройти первый день бесплатно" }).first();
    await expect(cta).toBeVisible();
    const box = await cta.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);

    // Якорная навигация скрыта, но CTA доступна.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("онбординг: варианты ответа — крупные тач-зоны, скролла нет", async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/onboarding");
    await waitForHydration(page);

    const option = page.locator("label").filter({ hasText: "Расстались" }).first();
    await expect(option).toBeVisible();
    const box = await option.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);

    const widths = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);
  });
});
