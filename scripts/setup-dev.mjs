#!/usr/bin/env node
/**
 * Готовит локальное окружение разработчика:
 * создаёт корневой .env со случайными ключами, если его ещё нет.
 *
 * Запуск: pnpm setup:dev
 */
import { existsSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dirname, "..");
const envPath = path.join(repoRoot, ".env");

if (existsSync(envPath)) {
  console.log("• .env уже существует — ничего не меняю.");
  process.exit(0);
}

const authSecret = randomBytes(48).toString("base64url");
const encryptionKey = randomBytes(32).toString("base64");

const template = `# Локальная конфигурация «Опоры». Сгенерировано pnpm setup:dev.
# НЕ КОММИТИТЬ. Для production используются отдельные секреты (см. .env.example).

APP_URL=http://localhost:3000

# --- База данных ---
# dev по умолчанию: встроенный PostgreSQL (PGlite), файл в apps/web/.data/dev
DATABASE_DRIVER=pglite
PGLITE_DATA_DIR=.data/dev
AUTO_MIGRATE=true
# production: postgres://user:password@host:5432/opora
DATABASE_URL=

# --- Auth и шифрование ---
AUTH_SECRET=${authSecret}
ENCRYPTION_KEY=${encryptionKey}
AUTH_DEV_SHOW_LINK=true
EMAIL_TRANSPORT=console

# --- LLM (через адаптер; на старте — fake) ---
LLM_PROVIDER=fake
LLM_API_KEY=
LLM_BASE_URL=

NEXT_TELEMETRY_DISABLED=1
`;

writeFileSync(envPath, template, { mode: 0o600 });
console.log("• Создан .env с локальными ключами.");
console.log("• Дальше: pnpm dev → http://localhost:3000");
