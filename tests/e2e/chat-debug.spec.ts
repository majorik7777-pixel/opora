import { test, type Page } from "@playwright/test";

/** Временный отладочный спек: смотрим сырой ответ /api/chat. */

async function chooseOption(page: Page, label: string): Promise<void> {
  await page.locator("label").filter({ hasText: label }).first().click();
}

async function login(page: Page): Promise<void> {
  const email = `dbg-${Date.now()}@example.com`;
  await page.goto("/onboarding");
  for (const [answer, next] of [
    ["Расстались", "Дальше"],
    ["1–4 недели", "Дальше"],
    ["Не могу отпустить", "Дальше"],
    ["Перестать постоянно думать об этом", "Дальше"],
    ["Засыпаю с трудом", "Дальше"],
  ] as const) {
    await chooseOption(page, answer);
    await page.getByRole("button", { name: next }).click();
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
}

test("debug chat stream", async ({ page }) => {
  page.on("console", (message) => console.log("[console]", JSON.stringify(message.type() + ": " + message.text())));
  page.on("pageerror", (error) => console.log("[pageerror]", error.message));
  await page.goto("/onboarding");
  await login(page);
  await page.goto("/app/chat");

  const raw = await page.evaluate(async () => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Мне очень плохо" }),
    });
    const text = await response.text();
    return { status: response.status, contentType: response.headers.get("content-type"), text };
  });
  console.log("[api]", JSON.stringify(raw).slice(0, 4000));

  await page.getByLabel("Сообщение").fill("Второе сообщение");
  await page.getByRole("button", { name: "Отправить" }).click();
  await page.waitForTimeout(6000);
  const dom = await page.evaluate(() => ({
    items: Array.from(document.querySelectorAll("main li")).map((li) => (li as HTMLElement).innerText),
    alerts: Array.from(document.querySelectorAll('[role="alert"]')).map((el) => (el as HTMLElement).innerText),
    counter: document.querySelector("main p")?.textContent,
  }));
  console.log("[domjson]", JSON.stringify(dom));
});
