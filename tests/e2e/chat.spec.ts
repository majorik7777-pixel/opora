import { expect, test, type Page } from "@playwright/test";

/**
 * T-101: чат — стриминг ответа, дневной лимит, мобильный 360.
 * Провайдер в e2e — fake: ответ детерминирован (LLM_PROVIDER=fake в test-env).
 */

const FAKE_REPLY_FRAGMENT = /ты не обязана быть сильной/i;

async function chooseOption(page: Page, label: string): Promise<void> {
  await page.locator("label").filter({ hasText: label }).first().click();
}

/** Проходит онбординг и входит по dev-magic-link, возвращая email. */
async function loginAsNewUser(page: Page): Promise<void> {
  const email = `chat-e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;

  await page.goto("/onboarding");
  await chooseOption(page, "Расстались");
  await page.getByRole("button", { name: "Дальше" }).click();
  await chooseOption(page, "1–4 недели");
  await page.getByRole("button", { name: "Дальше" }).click();
  await chooseOption(page, "Не могу отпустить");
  await page.getByRole("button", { name: "Дальше" }).click();
  await chooseOption(page, "Перестать постоянно думать об этом");
  await page.getByRole("button", { name: "Дальше" }).click();
  await chooseOption(page, "Засыпаю с трудом");
  await page.getByRole("button", { name: "Дальше" }).click();

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
  await expect(page).toHaveURL(/\/app$/);
}

test.describe("Чат T-101", () => {
  test("отправляет сообщение, показывает потоковый ответ и остаток лимита", async ({
    page,
  }) => {
    await loginAsNewUser(page);
    await page.goto("/app/chat");

    await expect(page.getByRole("heading", { name: "Поговорить с Опорой" })).toBeVisible();
    await expect(page.getByText("Осталось 5 из 5 сообщений сегодня")).toBeVisible();

    const input = page.getByLabel("Сообщение");
    await input.fill("Мне очень плохо сегодня");
    await page.getByRole("button", { name: "Отправить" }).click();

    await expect(page.getByText("Мне очень плохо сегодня")).toBeVisible();
    await expect(page.getByText(FAKE_REPLY_FRAGMENT)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText("Осталось 4 из 5 сообщений сегодня")).toBeVisible();

    // История сохраняется после перезагрузки (сообщения из БД, не из памяти).
    await page.reload();
    await expect(page.getByText("Мне очень плохо сегодня")).toBeVisible();
    await expect(page.getByText(FAKE_REPLY_FRAGMENT)).toBeVisible();
  });

  test("после 5 сообщений лимит закрывает ввод", async ({ page }) => {
    test.slow();
    await loginAsNewUser(page);
    await page.goto("/app/chat");

    for (let index = 1; index <= 5; index += 1) {
      const input = page.getByLabel("Сообщение");
      await input.fill(`Сообщение ${index}`);
      await page.getByRole("button", { name: "Отправить" }).click();
      await expect(
        page.getByText(`Осталось ${5 - index} из 5 сообщений сегодня`),
      ).toBeVisible({ timeout: 20_000 });
    }

    await expect(page.getByLabel("Сообщение")).toBeDisabled();
    await expect(page.getByText(/На сегодня лимит закончился/i)).toBeVisible();
  });

  test("кризисное сообщение показывает контакты помощи", async ({ page }) => {
    await loginAsNewUser(page);
    await page.goto("/app/chat");

    await page.getByLabel("Сообщение").fill("Я не хочу жить дальше");
    await page.getByRole("button", { name: "Отправить" }).click();

    await expect(page.getByText("Сейчас важнее другое")).toBeVisible();
    await expect(page.getByRole("link", { name: "112" })).toBeVisible();
  });

  test("мобильный 360: чат без горизонтального скролла", async ({ page }) => {
    await loginAsNewUser(page);
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/app/chat");

    const widths = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);

    await page.getByLabel("Сообщение").fill("Проверка мобильного чата");
    await page.getByRole("button", { name: "Отправить" }).click();
    await expect(page.getByText(FAKE_REPLY_FRAGMENT)).toBeVisible({ timeout: 20_000 });
  });
});
