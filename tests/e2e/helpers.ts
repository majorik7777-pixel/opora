import { expect, type Page } from "@playwright/test";

/**
 * Общие шаги e2e.
 *
 * Важно: клик по варианту до гидрации теряется (нативный input переключается,
 * React-состояние — нет), поэтому перед любым взаимодействием ждём маркер
 * `html[data-hydrated="true"]`, который ставит клиентский онбординг.
 */

export async function waitForHydration(page: Page): Promise<void> {
  await page.waitForSelector('html[data-hydrated="true"]', { timeout: 20_000 });
}

export async function chooseOption(page: Page, label: string): Promise<void> {
  await waitForHydration(page);

  // Кликаем по видимой карточке-лейблу, а не по sr-only input: у input нулевой
  // размер и клик по нему не всегда доходит до React-обработчика.
  const card = page.locator("label").filter({ hasText: label }).first();
  await card.click();

  const radio = page.getByRole("radio", { name: label }).first();
  if (await radio.count()) {
    // Проверяем, что состояние реально обновилось (иначе шаг не перейдёт).
    try {
      await expect(radio).toBeChecked({ timeout: 2_000 });
    } catch {
      await card.click();
      await expect(radio).toBeChecked();
    }
  }
}

/** Проходит онбординг и входит по dev-magic-link; возвращает email. */
export async function loginAsNewUser(page: Page): Promise<string> {
  const email = `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;

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
  await expect(devLink).toBeVisible();
  const href = await devLink.getAttribute("href");
  await page.goto(href ?? "/");
  await expect(page).toHaveURL(/\/welcome$/);
  await page.goto("/app");
  return email;
}
