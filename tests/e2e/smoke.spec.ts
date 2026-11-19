import { expect, test } from "@playwright/test";

test.describe("Смоук и защита", () => {
  test("healthcheck отвечает 200 и видит БД", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    const body = (await response.json()) as { status?: string; db?: string };
    expect(body.status).toBe("ok");
    expect(body.db).toBe("ok");
  });

  test("лендинг содержит оффер, цену и дисклеймер", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "вернуть опору",
    );
    await expect(page.getByText("990 ₽").first()).toBeVisible();
    await expect(
      page.getByText(/не является медицинской услугой/i).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /политик[аи] конфиденциальности/i }).first(),
    ).toBeVisible();
  });

  test("FAQ раскрывается (нативные details/summary)", async ({ page }) => {
    await page.goto("/");
    const summary = page
      .getByText("Это заменит психолога?", { exact: false })
      .first();
    await summary.scrollIntoViewIfNeeded();
    await summary.click();
    await expect(page.getByText(/Это программа самопомощи/i).first()).toBeVisible();
  });

  test("неверный magic link ведёт на /auth с ошибкой", async ({ page }) => {
    await page.goto("/auth/verify?token=definitely-not-a-valid-token-123456");
    await expect(page).toHaveURL(/\/auth\?error=invalid-link/);
    await expect(
      page.getByRole("alert").filter({ hasText: "Ссылка" }),
    ).toContainText("Ссылка уже использована");
  });

  test("юридические страницы доступны", async ({ page }) => {
    for (const path of [
      "/legal/privacy",
      "/legal/consent",
      "/legal/terms",
      "/legal/offer",
    ]) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });
});
