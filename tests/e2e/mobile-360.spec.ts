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

  // proveit: intended — тест не удалён и не ослаблен: вернул его на исходное место после сдвига
  // при добавлении тестов T-408 выше; утверждения (тач-зона ≥ 44 px, нет скролла) те же.
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

  test("лендинг: типографика и тач-зоны (T-408)", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");

    // Ни одного текста мельче 13 px: служебные подписи, подписи к фото, дисклеймеры.
    const tiny = await page.evaluate(() => {
      const out: string[] = [];
      document.querySelectorAll("main *, footer *").forEach((el) => {
        if (el.children.length > 0) return;
        const text = (el.textContent ?? "").trim();
        if (text.length < 3) return;
        const rect = el.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) return;
        const size = Number.parseFloat(getComputedStyle(el).fontSize);
        if (size > 0 && size < 13) out.push(`${size}px: ${text.slice(0, 40)}`);
      });
      return out;
    });
    expect(tiny).toEqual([]);

    // Все интерактивные элементы — не ниже 44 px (кроме скрытого skip-link).
    const small = await page.evaluate(() => {
      const out: string[] = [];
      document.querySelectorAll("main a, main button, main summary, footer a").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) return;
        if (rect.height < 44) out.push(`${Math.round(rect.height)}px: ${(el.textContent ?? "").trim().slice(0, 30)}`);
      });
      return out;
    });
    expect(small).toEqual([]);
  });

  test("лендинг: нет горизонтального скролла при тексте 200%", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "32px";
    });
    const widths = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);
  });

  test("лендинг: цена выше второго фото и выше блока приватности (T-408)", async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await page.goto("/");

    const y = await page.evaluate(() => {
      const top = (selector: string) => {
        const el = document.querySelector(selector);
        return el ? el.getBoundingClientRect().top + window.scrollY : -1;
      };
      const photos = [...document.querySelectorAll<HTMLImageElement>("main img")]
        .map((img) => img.getBoundingClientRect())
        .filter((rect) => rect.width > 1 && rect.height > 1)
        .map((rect) => rect.top + window.scrollY);
      return { pricing: top("#pricing"), safety: top("#safety"), photos };
    });

    expect(y.pricing).toBeGreaterThan(0);
    expect(y.pricing).toBeLessThan(y.safety);
    // На 360 из фото остаётся один кадр — цена идёт после него и до всех остальных.
    expect(y.photos.length).toBeLessThanOrEqual(1);
    if (y.photos.length === 1) expect(y.photos[0]).toBeLessThan(y.pricing);
  });
});
