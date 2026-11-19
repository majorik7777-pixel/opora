#!/usr/bin/env node
/**
 * Снимки экранов для приёмки/витрины (не для CI).
 *
 * Требуется запущенный production-сервер:
 *   pnpm build
 *   DATABASE_DRIVER=pglite PGLITE_DATA_DIR=.data/shots AUTO_MIGRATE=true \
 *   AUTH_DEV_SHOW_LINK=true EMAIL_TRANSPORT=console \
 *   AUTH_SECRET=shots-secret-0123456789 \
 *   ENCRYPTION_KEY="BwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwc=" \
 *   APP_URL=http://127.0.0.1:3100 pnpm --filter @opora/web start:e2e
 *
 * Затем: node scripts/capture-screens.mjs
 * Каталог вывода: ../screenshots (или $SCREENSHOTS_DIR).
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const BASE = process.env.SCREENSHOTS_BASE_URL ?? "http://127.0.0.1:3100";
const OUT =
  process.env.SCREENSHOTS_DIR ??
  path.resolve(import.meta.dirname, "../../screenshots");

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });

const desktop = await browser.newContext({
  viewport: { width: 1280, height: 900 },
  deviceScaleFactor: 2,
  locale: "ru-RU",
});
const page = await desktop.newPage();

await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await page.screenshot({ path: path.join(OUT, "01-landing-desktop.png") });
await page.screenshot({
  path: path.join(OUT, "01b-landing-desktop-full.png"),
  fullPage: true,
});

const mobile = await browser.newContext({
  viewport: { width: 360, height: 800 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: "ru-RU",
});
const mobilePage = await mobile.newPage();
await mobilePage.goto(`${BASE}/`, { waitUntil: "networkidle" });
await mobilePage.screenshot({
  path: path.join(OUT, "02-landing-mobile-360.png"),
});
await mobilePage.screenshot({
  path: path.join(OUT, "02b-landing-mobile-360-full.png"),
  fullPage: true,
});
await mobilePage.goto(`${BASE}/onboarding`, { waitUntil: "networkidle" });
await mobilePage.screenshot({
  path: path.join(OUT, "03-onboarding-mobile-360.png"),
});

const email = `screens-${Date.now()}@example.com`;
const choose = (label) =>
  page.locator("label").filter({ hasText: label }).first().click();
const next = () => page.getByRole("button", { name: "Дальше" }).click();

await page.goto(`${BASE}/onboarding`);
await choose("Расстались");
await next();
await choose("1–4 недели");
await next();
await choose("Не могу отпустить");
await next();
await choose("Перестать постоянно думать об этом");
await next();
await choose("Засыпаю с трудом");
await next();
await choose("Мне 18+");
await choose("Согласна с обработкой данных");
await choose("рассказываю о своём состоянии");
await page.screenshot({ path: path.join(OUT, "04-onboarding-consents.png") });
await page.getByRole("button", { name: "Начать" }).click();
await page.waitForURL(/\/auth/);
await page.getByLabel("Почта").fill(email);
await page.getByRole("button", { name: "Получить ссылку для входа" }).click();

const devLink = page.getByRole("link", {
  name: "Открыть ссылку для входа",
});
await devLink.waitFor();
await page.screenshot({ path: path.join(OUT, "05-auth-dev-link.png") });
const href = await devLink.getAttribute("href");
await page.goto(href ?? "/");
await page.waitForURL(/\/app$/);
await page.waitForLoadState("networkidle");
await page.screenshot({ path: path.join(OUT, "06-app-desktop.png") });

await page.goto(`${BASE}/app/chat`);
await page.waitForLoadState("networkidle");
await page.screenshot({ path: path.join(OUT, "07-chat-framework.png") });

await page.setViewportSize({ width: 360, height: 800 });
await page.goto(`${BASE}/app`);
await page.waitForLoadState("networkidle");
await page.screenshot({ path: path.join(OUT, "08-app-mobile-360.png") });

await browser.close();
console.log(`Скриншоты сохранены в ${OUT}`);
