import { expect, test, type Page } from "@playwright/test";

/** T-104 (DEV): оплата выдаёт доступ и ведёт на страницу успеха. */

async function chooseOption(page: Page, label: string): Promise<void> {
  await page.locator("label").filter({ hasText: label }).first().click();
}

async function loginAsNewUser(page: Page): Promise<void> {
  const email = `pay-e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;

  await page.goto("/onboarding");
  for (const answer of [
    "Расстались",
    "1–4 недели",
    "Не могу отпустить",
    "Перестать постоянно думать об этом",
    "Засыпаю с трудом",
  ]) {
    await chooseOption(page, answer);
    await page.getByRole("button", { name: "Дальше" }).click();
  }

  await chooseOption(page, "Мне 18+");
  await chooseOption(page, "Согласна с обработкой данных");
  await chooseOption(page, "рассказываю о своём состоянии");
  await page.getByRole("button", { name: "Начать" }).click();

  await page.getByLabel("Почта").fill(email);
  await page.getByRole("button", { name: "Получить ссылку для входа" }).click();
  const devLink = page.getByRole("link", { name: "Открыть ссылку для входа" });
  const href = await devLink.getAttribute("href");
  await page.goto(href ?? "/");
  await expect(page).toHaveURL(/\/welcome$/);
  await page.goto("/app");
}

test.describe("Оплата DEV", () => {
  test("доступ открывается и виден в программе", async ({ page }) => {
    await loginAsNewUser(page);

    await page.goto("/app/program");
    await expect(page.getByRole("link", { name: /Открыть доступ за 990/ })).toBeVisible();

    await page.getByRole("link", { name: /Открыть доступ за 990/ }).click();
    await expect(page).toHaveURL(/\/paywall$/);
    await expect(page.getByText("990 ₽").first()).toBeVisible();

    await page.getByRole("button", { name: /Открыть доступ — DEV-режим/ }).click();
    await expect(page).toHaveURL(/\/welcome\/purchase$/);
    await expect(page.getByText("Доступ открыт", { exact: true })).toBeVisible();

    await page.getByRole("link", { name: "Открыть программу" }).click();
    await expect(page).toHaveURL(/\/app\/program$/);
    await expect(page.getByText("Доступ открыт · оплачено")).toBeVisible();
  });

  test("повторный заход на /paywall при доступе уводит в программу", async ({ page }) => {
    await loginAsNewUser(page);
    await page.goto("/paywall");
    await page.getByRole("button", { name: /Открыть доступ — DEV-режим/ }).click();
    await expect(page).toHaveURL(/\/welcome\/purchase$/);

    await page.goto("/paywall");
    await expect(page).toHaveURL(/\/app\/program$/);
  });
});
