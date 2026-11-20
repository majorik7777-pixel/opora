import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Сквозной путь Phase 0–1:
 * лендинг → онбординг → magic link (dev) → /app.
 */
test.describe("Сквозной путь", () => {
  const email = `e2e-${Date.now()}@example.com`;

  async function chooseOption(page: Page, label: string): Promise<void> {
    await page.locator("label").filter({ hasText: label }).first().click();
  }

  test("гость проходит онбординг, входит по magic link и попадает в /app", async ({
    page,
  }) => {
    // 1. Лендинг
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /вернуть опору/i,
    );

    await page
      .getByRole("link", { name: "Начать первый день" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/onboarding$/);

    // 2. Онбординг: 5 вопросов
    await expect(page.getByText("Вопрос 1 из 5")).toBeVisible();
    await chooseOption(page, "Расстались");
    await expect(page.getByRole("radio", { name: "Расстались" })).toBeChecked();
    await page.getByRole("button", { name: "Дальше" }).click();

    await chooseOption(page, "1–4 недели");
    await page.getByRole("button", { name: "Дальше" }).click();

    await chooseOption(page, "Не могу отпустить");
    await page.getByRole("button", { name: "Дальше" }).click();

    await chooseOption(page, "Перестать постоянно думать об этом");
    await page.getByRole("button", { name: "Дальше" }).click();

    await chooseOption(page, "Засыпаю с трудом");
    await page.getByRole("button", { name: "Дальше" }).click();

    // 3. Согласия
    await expect(page.getByText("Последний шаг")).toBeVisible();
    const startButton = page.getByRole("button", { name: "Начать" });
    await expect(startButton).toBeDisabled();

    await chooseOption(page, "Мне 18+");
    await chooseOption(page, "Согласна с обработкой данных");
    await chooseOption(page, "рассказываю о своём состоянии");
    await expect(startButton).toBeEnabled();
    await startButton.click();

    // 4. Вход по magic link (dev-письмо)
    await expect(page).toHaveURL(/\/auth(\?|$)/);
    await page.getByLabel("Почта").fill(email);
    await page
      .getByRole("button", { name: "Получить ссылку для входа" })
      .click();

    const devLink = page.getByRole("link", {
      name: "Открыть ссылку для входа",
    });
    await expect(devLink).toBeVisible();
    const link = await devLink.getAttribute("href");
    expect(link).toBeTruthy();

    // 5. Переход по ссылке → /app
    await page.goto(link ?? "/");
    await expect(page).toHaveURL(/\/app$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Привет",
    );
    await expect(page.getByText("День 1 из 7")).toBeVisible();
    await expect(page.getByText("Ты отметила:")).toContainText("расстались");

    // 6. Сессия живёт при повторном заходе
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Привет",
    );

    // 7. Доступность ключевого экрана
    const axeResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const serious = axeResults.violations.filter(
      (violation) =>
        violation.impact === "critical" || violation.impact === "serious",
    );
    expect(
      serious.map((violation) => `${violation.id}: ${violation.help}`),
    ).toEqual([]);
  });

  test("без входа /app уводит на /auth", async ({ page }) => {
    await page.goto("/app");
    await expect(page).toHaveURL(/\/auth\?next=%2Fapp/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Вход в «Опору»",
    );
  });

  test("доступность лендинга и онбординга", async ({ page }) => {
    await page.goto("/");
    const landing = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const landingSerious = landing.violations.filter(
      (violation) =>
        violation.impact === "critical" || violation.impact === "serious",
    );
    expect(
      landingSerious.map((violation) => `${violation.id}: ${violation.help}`),
    ).toEqual([]);

    await page.goto("/onboarding");
    const onboarding = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const onboardingSerious = onboarding.violations.filter(
      (violation) =>
        violation.impact === "critical" || violation.impact === "serious",
    );
    expect(
      onboardingSerious.map((violation) => `${violation.id}: ${violation.help}`),
    ).toEqual([]);
  });
});
