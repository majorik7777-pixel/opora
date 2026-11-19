import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";
import { E2E_BASE_URL, E2E_DATA_DIR, E2E_ENV } from "./tests/e2e/test-env";

const desktop = { ...devices["Desktop Chrome"] };
const mobile = {
  ...devices["Pixel 7"],
  // Продукт проектируется с 360 px — проверяем именно этот вьюпорт.
  viewport: { width: 360, height: 800 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  outputDir: "./test-results",
  use: {
    baseURL: E2E_BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    locale: "ru-RU",
    timezoneId: "Europe/Moscow",
    // В локальной среде используем установленный Google Chrome, чтобы не
    // скачивать браузеры; в CI — штатный chromium из `playwright install`.
    channel: process.env.CI ? undefined : "chrome",
  },
  projects: [
    {
      name: "desktop",
      use: { ...desktop, channel: process.env.CI ? undefined : "chrome" },
    },
    {
      name: "mobile-360",
      use: { ...mobile, channel: process.env.CI ? undefined : "chrome" },
    },
  ],
  webServer: {
    // Данные e2e-БД всегда создаются с нуля: удаляем прошлый прогон до старта сервера.
    command: `rm -rf ${JSON.stringify(E2E_DATA_DIR)} && pnpm --filter @opora/web start:e2e`,
    url: `${E2E_BASE_URL}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: E2E_ENV,
  },
});

// Используем путь к конфигу, чтобы относительные пути не ломались при запуске
// из другого каталога.
void fileURLToPath;
