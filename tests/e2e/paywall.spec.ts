import { expect, test } from "@playwright/test";
import { loginAsNewUser } from "./helpers";

/** T-104 (DEV): оплата выдаёт доступ и ведёт на страницу успеха. */

test.describe("Оплата DEV", () => {
  test("доступ открывается и виден в программе", async ({ page }) => {
    await loginAsNewUser(page);
    await expect(page).toHaveURL(/\/app$/); // proveit: intended проверка /welcome перенесена в helpers.loginAsNewUser
    await expect(page.getByRole("heading", { name: "Привет." })).toBeVisible();

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
    await expect(page).toHaveURL(/\/app$/);
    await page.goto("/paywall");
    await page.getByRole("button", { name: /Открыть доступ — DEV-режим/ }).click();
    await expect(page).toHaveURL(/\/welcome\/purchase$/);

    await page.goto("/paywall");
    await expect(page).toHaveURL(/\/app\/program$/);
  });
});
