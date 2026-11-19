# Технический план реализации

Версия 1.0 · 19.11.2026
Дополняет `07-architecture.md` до уровня «можно садиться и писать код». Стек и границы — из 07; здесь — конкретика: маршруты, схема БД, API, LLM-слой, платежи, фоновые задачи, окружение, план спринтов.

---

## 1. Стек

| Слой | Выбор | Почему |
|---|---|---|
| Фронтенд + бэкенд | Next.js 15 (App Router), TypeScript | SSR для страниц, server actions, один деплой |
| UI | Tailwind CSS + shadcn/ui + свои токены | скорость и единый стиль |
| API | tRPC для клиента + REST для вебхуков | типы из коробки |
| БД | PostgreSQL 16 + Drizzle ORM | простые миграции, типы |
| Очереди | Redis + BullMQ | напоминания, отчёты, сверка платежей |
| Файлы | S3-совместимое хранилище в РФ (Yandex Object Storage / Selectel) | аудио, бэкапы |
| Auth | magic link по email + httpOnly cookie-сессии | без паролей, меньше рисков |
| Платежи | ЮKassa (разовые платежи; подписка позже) | работает с самозанятым, чеки |
| LLM | собственный адаптер; на старте — временный провайдер | смена без переписывания |
| Наблюдаемость | Sentry + структурные логи + свои события | ошибки и воронка |
| Деплой | Docker Compose на VPS в РФ (Timeweb/Selectel/Yandex Cloud) + Caddy | дёшево и просто |
| Тесты | Vitest (unit), Playwright (e2e), evals для промптов | качество без команды |

---

## 2. Структура репозитория

```
repo/
├── apps/
│   ├── web/                     # Next.js: страницы, server actions, tRPC, admin
│   └── worker/                  # BullMQ: напоминания, отчёты, сверка платежей
├── packages/
│   ├── core/                    # домены: auth, chat, memory, diary, program, billing, safety
│   ├── db/                      # Drizzle schema, миграции, сиды программ
│   ├── llm/                     # адаптер, prompt registry, context builder, cost
│   ├── shared/                  # zod-схемы, типы, константы, коды ошибок
│   └── ui/                      # компоненты дизайн-системы
├── infra/                       # docker-compose, Caddyfile, backup.sh
├── docs/                        # prd, adr, specs, runbooks
├── tasks/                       # задачи для агентов
├── tests/                       # e2e
├── AGENTS.md
├── .env.example
└── README.md
```

Правила: `core` не импортирует Next/React; `web` не обращается к БД мимо `core`; `llm` не знает доменов.

---

## 3. Маршруты (web)

| Путь | Тип | Назначение |
|---|---|---|
| `/` | SSG/ISR | лендинг |
| `/onboarding` | client | 5 шагов, согласия |
| `/app` | server | домашний экран: день, прогресс, быстрые действия |
| `/app/chat` | client | чат (SSE) |
| `/app/diary` | server/client | лента дневника |
| `/app/diary/[id]` | server | запись |
| `/app/program` | server | обзор 7 дней |
| `/app/program/[day]` | server | урок, практика, рефлексия |
| `/app/report` | server | отчёт |
| `/app/settings` | server | профиль, данные, подписка |
| `/paywall` | server | оффер и оплата |
| `/checkout/return` | server | возврат с ЮKassa |
| `/legal/terms`, `/legal/privacy`, `/legal/offer`, `/legal/consent` | SSG | документы |
| `/admin` | server + RBAC | контент, пользователи, платежи, safety |
| `/api/webhooks/yookassa` | REST | платёжные события |
| `/api/health` | REST | healthcheck |

---

## 4. Схема БД (Drizzle, PostgreSQL)

```
users
  id uuid pk, email citext unique, status enum(active, blocked, deleted),
  age_confirmed bool, created_at, updated_at, deleted_at

consents
  id, user_id, kind enum(processing, special, cross_border, marketing),
  version, accepted_at, ip_hash

sessions_auth
  id, user_id, token_hash, expires_at, created_at, revoked_at

chat_threads
  id, user_id, title, created_at, updated_at, deleted_at

messages
  id, thread_id, role enum(user, assistant, system), content_enc bytea,
  tokens int, safety_flag bool, provider, model, created_at

memory_facts
  id, user_id, fact_enc bytea, source_message_id, confidence numeric,
  created_at, deleted_at

diary_entries
  id, user_id, entry_date date, mood smallint, text_enc bytea,
  audio_key text, transcript_enc bytea, tags text[], created_at, deleted_at

programs
  id, slug, title, description, days_count, active bool

program_days
  id, program_id, day_num, title, lesson_md, practice_md,
  reflection_prompts jsonb, version int

enrollments
  id, user_id, program_id, status enum(active, completed, abandoned),
  current_day int, started_at, finished_at

enrollment_progress
  id, enrollment_id, day_num, completed_at, reflection jsonb

payments
  id, user_id, amount, currency, status enum(pending, succeeded, refunded, failed),
  provider, provider_payment_id unique, idempotency_key unique,
  plan enum(program, subscription), created_at

subscriptions
  id, user_id, plan, status, current_period_end, provider_subscription_id

safety_events
  id, user_id, severity enum(low, medium, high), trigger, action,
  reviewed_by, created_at

events
  id, user_id nullable, name, props jsonb, ts
  -- партиционирование по месяцам

audit_log
  id, actor, action, entity, entity_id, before_hash, after_hash, created_at
```

Правила: uuid v7, `content_enc`/`text_enc` — AES-GCM; `events` без ПДн; `audit_log` append-only; soft-delete + джоб анонимизации через 30 дней.

---

## 5. API (tRPC)

```
auth.requestMagicLink({ email })
auth.verify({ token }) -> session cookie
auth.logout()

onboarding.save({ answers, consents }) -> user
onboarding.status()

chat.startThread()
chat.send({ threadId, text }) -> stream (SSE)
chat.history({ threadId, cursor })
chat.deleteThread({ threadId })

diary.create({ mood, text?, audioKey?, tags })
diary.list({ cursor })
diary.get({ id })
diary.update({ id, patch })
diary.delete({ id })

program.list()
program.enroll({ programId })
program.day({ enrollmentId, dayNum })
program.completeDay({ enrollmentId, dayNum, reflection })
program.report({ enrollmentId })

billing.plans()
billing.createPayment({ plan }) -> { confirmationUrl }
billing.status({ paymentId })

memory.list()
memory.delete({ id })

me.export()
me.delete()

admin.content.* | admin.payments.* | admin.safety.*
```

REST: `POST /api/webhooks/yookassa` (проверка подписи, идемпотентность).

---

## 6. LLM-слой

### 6.1. Интерфейс

```ts
interface LlmProvider {
  chat(req: ChatRequest): AsyncIterable<Chunk>
  embed(texts: string[]): Promise<number[][]>
  moderate(text: string): Promise<{ flagged: boolean; categories: string[] }>
}
```

Реализации: `fake` (тесты), `foreign` (прототип), `yandex` / `gigachat` / `cloudru` (production), `local` (позже).

### 6.2. Сборка контекста

- Системный промпт: персона + правила + safety + дисклеймер.
- Онбординг: тип ситуации, давность, боль, цель, сон.
- Программа: текущий день, тема, вчерашняя рефлексия.
- Память: до 10 фактов с confidence > 0.6.
- Дневник: последние 3 записи (сводка, не полный текст).
- История: последние 8 сообщений.
- Бюджет: ≤ 2 500 токенов на запрос; обрезка по приоритету.

### 6.3. Промпты (файлы `packages/llm/prompts/`)

- `chat.system.v1` — персона и правила;
- `memory.extract.v1` — извлечение фактов (JSON);
- `diary.analyze.v1` — разбор записи;
- `report.weekly.v1` — недельный отчёт;
- `report.final.v1` — финальный отчёт программы;
- `safety.classify.v1` — классификация риска (или правила + модельный классификатор).

Версия промпта — id; изменение — через ADR.

### 6.4. Стоимость и лимиты

- Таблица цен провайдеров в конфиге.
- Учёт `tokens_in/out`, `cost` в `events`, без текста.
- Лимиты: 5 сообщений/день free, 100/день paid fair use.
- Кэш эмбеддингов; ретраи 2 с джиттером; circuit breaker.

---

## 7. Safety

Пайплайн на каждое сообщение:
1. Быстрые правила (regex + словарь) — суицид, самоповреждение, насилие, угроза.
2. Модельный классификатор (если включён).
3. Если риск: не вызывать обычный чат; показать кризисный экран; записать `safety_event` без содержания; пометить очередь.
4. Дисклеймер и 112 — всегда доступны.

Тесты: набор фраз (позитивные/негативные), прогон в CI.

---

## 8. Платежи

1. `billing.createPayment` → ЮKassa `POST /payments` с `Idempotence-Key`.
2. Redirect на `confirmation_url`.
3. Вебхук `payment.succeeded` → проверка подписи → идемпотентная запись → выдача entitlement (доступ к программе).
4. `payment.canceled` / `refund.succeeded` → обновление статуса.
5. Чек — через ЮKassa; email пользователя.
6. Возвраты — вручную через админку на старте.

Идемпотентность: уникальный `provider_payment_id`, ключ на клиенте, повторная обработка вебхука безопасна.

---

## 9. Фоновые задачи (worker)

| Job | Расписание | Что делает |
|---|---|---|
| `reminders.daily` | 19:00 по TZ пользователя | письмо/push «день N» |
| `reminders.return` | ежедневно | письмо после 2 дней тишины |
| `reports.weekly` | пн 10:00 | недельный отчёт по дневнику |
| `reports.final` | после 7-го дня | финальный отчёт |
| `payments.reconcile` | каждые 15 мин | сверка зависших платежей |
| `data.cleanup` | 03:00 | анонимизация soft-deleted |
| `safety.queue` | каждые 5 мин | уведомление админа о high-risk |

---

## 10. События аналитики

`landing_view`, `onboarding_start`, `onboarding_complete`, `chat_first_message`, `chat_message`, `diary_first_entry`, `program_enroll`, `program_day_open`, `program_day_complete`, `paywall_view`, `checkout_start`, `purchase_success`, `report_view`, `safety_event`, `export_data`, `delete_account`.

Свойства: `user_id` (nullable), `day`, `channel`, `variant`; без текста и ПДн.

---

## 11. Безопасность

- AES-GCM для `content_enc`, `text_enc`, `fact_enc`, `transcript_enc`; ключи в env, ротация.
- Логи без ПДн; Sentry `beforeSend` вырезает поля.
- Rate limit: auth 5/мин/IP, chat 20/мин/user, payment 10/мин/user.
- RBAC для админки, 2FA для админа.
- CSRF: SameSite=Lax + проверка origin для мутаций.
- Заголовки: CSP, HSTS, X-Frame-Options.
- Бэкапы ежедневно, шифрованные, проверка восстановления раз в месяц.
- Экспорт/удаление: ≤ 30 дней на анонимизацию.

---

## 12. Окружение (`.env.example`)

```
DATABASE_URL=
REDIS_URL=
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=
AUTH_SECRET=
ENCRYPTION_KEY=
LLM_PROVIDER=fake            # fake | foreign | yandex | gigachat
LLM_API_KEY=
LLM_BASE_URL=
YOOKASSA_SHOP_ID=
YOOKASSA_SECRET_KEY=
SENTRY_DSN=
APP_URL=
ADMIN_EMAILS=
```

---

## 13. План спринтов (8 недель)

| Неделя | Задачи | Результат |
|---|---|---|
| 0 | репозиторий, AGENTS.md, ADR, дизайн-токены, CI, staging | каркас |
| 1 | auth magic link, users, consents, онбординг, лендинг | можно войти и пройти онбординг |
| 2 | LLM-адаптер (fake + временный), чат со стримингом, лимит 5/день | можно поговорить |
| 3 | дневник: текст, настроение, лента; память (факты) | дневник работает |
| 4 | программа: контент 7 дней, прогресс, рефлексия | программа проходится |
| 5 | ЮKassa, paywall, entitlement, вебхук, чеки | можно заплатить |
| 6 | отчёты, worker, напоминания, админка контента, события | продукт автоматизирован |
| 7 | safety, юр. тексты, экспорт/удаление, мобильная полировка | закрытая бета |
| 8 | багфикс, нагрузка, релиз, runbook | публичный запуск |

### Первый спринт (детально)
1. `pnpm init` workspace, `apps/web`, `packages/shared`, `db`, `ui`.
2. Tailwind + токены из `10-design.md`.
3. Схема БД: users, consents, auth.
4. Auth magic link (dev: письмо в консоль).
5. Онбординг 5 шагов + сохранение.
6. Лендинг по `11-copy.md`.
7. Playwright: сценарий «онбординг → главная».
8. CI: lint, typecheck, test, build.

---

## 14. Definition of Done

- Код собирается, типы проходят, линтер чист.
- Есть тест на сценарий (unit/e2e).
- ПДн не в логах; новые поля зашифрованы, если чувствительные.
- Обновлены `tasks/`, при решении — ADR.
- Мобильный вид проверен на 360 px.
- Ошибки обработаны, есть пустые и загрузочные состояния.

---

## 15. Риски реализации

| Риск | Митигация |
|---|---|
| Слишком большой скоуп | жёсткий порядок: сначала сквозной путь «онбординг → чат → день 1 → оплата» |
| LLM-провайдер недоступен | `fake` для разработки, адаптер, позже production-провайдер |
| Платежи и вебхуки | тестовый магазин, идемпотентность, сверка |
| ПДн | шифрование, минимизация, экспорт/удаление, юрист до беты |
| Соло-скорость | вертикальные срезы, без микросервисов, без нативных приложений |
