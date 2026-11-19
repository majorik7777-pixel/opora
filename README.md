# Опора

Веб-сервис психологической самопомощи: дневник, поддержка AI-собеседника и короткие 7-дневные программы. Первая программа — «Пережить расставание». Аудитория — женщины 25–45 лет, РФ, 18+. Это не медицина: сервис не ставит диагнозы и не заменяет специалиста.

Репозиторий — pnpm-workspace (модульный монолит, ADR-0001). Phase 0–1 собрана: каркас и дизайн-система, лендинг, онбординг с согласиями, вход по magic link, главный экран `/app`, e2e и CI; задачи T-001…T-006 сданы в `review` (приёмка — за основателем/лидом). Полноценных чата, дневника, программы, оплаты и реального LLM-провайдера пока нет — это следующие задачи T-101…T-105.

Статус: **Phase 0–1 — реализация сдана на приёмку** (задачи `T-001…T-006` в статусе `review`). Состав задач и их статусы — в [`tasks/`](tasks/README.md); источник правды по продукту — [`docs/planning/`](docs/planning/README.md).

---

## Требования

- **Node.js >= 22** (проверено на 22.x).
- **pnpm 10** — версия зафиксирована в `packageManager` (`pnpm@10.34.9`). Удобно через `corepack enable` или установщик pnpm.
- Для e2e-тестов локально — установленный **Google Chrome** (Playwright запускает его через `channel: "chrome"`). В CI используется штатный Chromium.
- PostgreSQL и Docker локально **не нужны**: dev/e2e работают на встроенном PGlite (см. ADR-0002).

## Быстрый старт

```bash
pnpm install        # зависимости workspace
pnpm setup:dev      # создаёт корневой .env со случайными AUTH_SECRET и ENCRYPTION_KEY
pnpm dev            # Next.js на http://localhost:3000
```

`pnpm setup:dev` безопасно запускать повторно: если `.env` уже есть, скрипт его не трогает. Шаблон всех переменных — [`.env.example`](.env.example).

Next.js читает env-файлы относительно каталога приложения, поэтому `setup:dev` дополнительно создаёт симлинк `apps/web/.env → ../../.env`. Альтернатива на сервере — передавать переменные окружением процесса (systemd/docker), без `.env`.

### Как проверить основные сценарии в dev

- `/` — лендинг.
- `/onboarding` — 5 шагов и согласия; черновик ответов сохраняется в зашифрованную cookie до входа.
- `/auth` — запрос magic-link; при `EMAIL_TRANSPORT=console` письмо печатается в консоль, а при `AUTH_DEV_SHOW_LINK=true` dev-ссылка показывается в интерфейсе.
- `/app` — главный экран после входа; доступен только после онбординга.
- `/api/health` — healthcheck для e2e и деплоя.

## Команды

Запускаются из корня репозитория.

| Команда | Что делает |
|---|---|
| `pnpm dev` | dev-сервер `apps/web` на `localhost:3000` |
| `pnpm build` | production-сборка Next.js |
| `pnpm start` | запуск собранного приложения на `localhost:3000` |
| `pnpm lint` | ESLint по всему workspace (включая правила границ слоёв) |
| `pnpm typecheck` | `tsc --noEmit` для инструментов и всех пакетов |
| `pnpm test` | unit/integration-тесты Vitest во всех пакетах (`pnpm -r run test`) |
| `pnpm test:e2e` | production-сборка + Playwright (порт `3100`, отдельная PGlite-БД в `.data/e2e`) |
| `pnpm verify` | `lint + typecheck + test + build` — то же, что требует CI |
| `pnpm db:generate` | сгенерировать SQL-миграцию Drizzle (runtime-миграции Phase 0–1 — в `packages/db/src/migrations.ts`) |
| `pnpm db:migrate` | применить миграции к БД из `DATABASE_URL` (production-способ) |

Unit/integration-тесты живут в пакетах (`packages/shared|db|core|llm`), e2e — в [`tests/e2e`](tests/e2e). Playwright-конфиг поднимает сервер сам и гоняет два проекта: desktop и мобильный `360 px`.

## Дизайн

Визуальный язык v2 внедрён (19.11.2026, D-033): «прохладная бумага и мох» — палитра
paper/ink/moss/wine, гротеск Onest ведёт, Literata — только «событие», редакционная сетка,
горизонтальные линии вместо карточек с тенями. Материалы: [`docs/design/`](docs/design/README.md)
(диагноз, три референса Clue/Two Chairs/Maven, направление v2, российская адаптация, промпты для
фото), задачи `tasks/T-201…T-205` (T-201/T-202 — review). Для будущих сессий установлен проектный
скилл [`.agents/skills/design-opora/SKILL.md`](.agents/skills/design-opora/SKILL.md).

Юридические факты перепроверены по открытым источникам:
[`docs/reports/legal-check-2026-11-19.md`](docs/reports/legal-check-2026-11-19.md) (D-032).

## Переменные окружения

Канонический файл — **корневой** `.env` (симлинк `apps/web/.env` создаёт `setup:dev`); переменные можно также передавать окружением процесса. Полный список с комментариями — [`.env.example`](.env.example); ключевые:

- `APP_URL` — базовый URL приложения.
- `DATABASE_DRIVER=pglite|postgres`, `PGLITE_DATA_DIR`, `DATABASE_URL`, `AUTO_MIGRATE` — база данных. Dev по умолчанию: `pglite` + `.data/dev` + авто-миграции.
- `AUTH_SECRET`, `ENCRYPTION_KEY` — секреты auth и шифрования (пустые в `.env.example`, генерируются `pnpm setup:dev`).
- `AUTH_DEV_SHOW_LINK`, `EMAIL_TRANSPORT` — dev-режим magic link и транспорт писем (`console` в Phase 0–1).
- `LLM_PROVIDER=fake|foreign|yandex|gigachat|cloudru`, `LLM_API_KEY`, `LLM_BASE_URL` — LLM только через адаптер `@opora/llm`; сейчас `fake`.
- `NEXT_TELEMETRY_DISABLED=1`.

Секретов в репозитории нет; `.env` в `.gitignore`.

## Структура репозитория

```
opora/
├── apps/
│   ├── web/              # Next.js 15.5 (App Router), React 19: лендинг, онбординг, /app
│   └── worker/           # каркас BullMQ-воркера: напоминания/отчёты/платежи — позже
├── packages/
│   ├── core/             # домены: auth, onboarding, чат, дневник, программы, billing, safety
│   ├── db/               # Drizzle-схема, миграции, репозитории; PGlite в dev, PostgreSQL в prod
│   ├── llm/              # адаптер LLM-провайдеров (fake → провайдер РФ в T-101)
│   ├── shared/           # zod-схемы, константы, типы API; серверные утилиты — @opora/shared/server
│   └── ui/               # дизайн-система: токены и компоненты
├── tests/e2e/            # Playwright-сценарии и e2e-окружение (PGlite .data/e2e)
├── infra/                # docker-compose (PostgreSQL/Redis), Caddyfile для production
├── docs/
│   ├── planning/         # исходные документы проекта: решения, продукт, дизайн, тексты, техплан
│   ├── adr/              # архитектурные решения
│   ├── specs/            # контракты доменов
│   ├── runbooks/         # деплой, бэкапы
│   ├── prd.md            # PRD Phase 0–1
│   └── DEFINITION_OF_DONE.md
├── tasks/                # задачи для AI-агентов (формат и статусы — tasks/README.md)
├── scripts/setup-dev.mjs # генерация локального .env + симлинк apps/web/.env
├── .env.example
├── AGENTS.md             # главный документ для любого AI-агента
└── README.md
```

Часть каталогов пока наполняется задачами Phase 0–1 — структура выше является целевой и зафиксирована в ADR-0001.

## Документация

- [AGENTS.md](AGENTS.md) — главный документ для AI-агента: ограничения, границы, команды, процесс.
- [docs/planning/README.md](docs/planning/README.md) — индекс планировочных документов (источник правды по продукту).
- [docs/DEFINITION_OF_DONE.md](docs/DEFINITION_OF_DONE.md) — что считается готовой задачей.
- [docs/adr/](docs/adr/) — архитектурные решения: [0001 стек и границы](docs/adr/0001-stack-and-boundaries.md), [0002 PGlite в dev](docs/adr/0002-dev-database-pglite.md), [0003 auth, шифрование, согласия](docs/adr/0003-auth-encryption-and-consents.md).
- [docs/prd.md](docs/prd.md) — PRD Phase 0–1.
- [docs/specs/onboarding.md](docs/specs/onboarding.md) — контракт онбординга.
- [docs/runbooks/deploy-backup.md](docs/runbooks/deploy-backup.md) — деплой и бэкапы.
- [tasks/README.md](tasks/README.md) — как вести задачи; сами задачи — `tasks/T-*.md`.

## Phase 0–1: состав и статусы

| Задача | Содержание | Статус |
|---|---|---|
| T-001 | Каркас репозитория и дизайн-система | review |
| T-002 | Лендинг и публичные страницы | review |
| T-003 | Онбординг: 5 шагов, согласия, БД | review |
| T-004 | Magic-link auth, сессии | review |
| T-005 | `/app` после онбординга | review |
| T-006 | Playwright, CI, a11y и мобильный 360 | review |

Следующие задачи (planned): T-101 чат, T-102 дневник, T-103 программа 7 дней, T-104 оплата, T-105 safety. Подробности — в [`tasks/`](tasks/README.md).

**Вне Phase 0–1:** реальный LLM-провайдер (сейчас `fake`), реальная отправка писем (SMTP), ЮKassa и подписка, голос, админка, аналитика, напоминания, PWA/SEO/реклама.

## Данные и безопасность (кратко)

Психологические данные считаются специальной категорией персональных данных РФ, поэтому: хранение в РФ, шифрование чувствительных полей (AES-256-GCM), email ищется по HMAC-отпечатку, IP хранится только хешем, согласия пишутся отдельными строками с версией, 18+ подтверждается в онбординге. Детали — [ADR-0003](docs/adr/0003-auth-encryption-and-consents.md) и [docs/planning/08-legal-pdn.md](docs/planning/08-legal-pdn.md).
