# Архитектура и процесс разработки

Версия 1.0 · 19.11.2026
Назначение: структура кода, границы модулей, данные, API, LLM-адаптер и правила работы двух AI-харнесов (DeepSeek Harness + Hermes). Документ — часть репозитория; меняется через ADR.

---

## 1. Принципы

1. **Модульный монолит.** Один деплой, но жёсткие границы папок и доменов. Без микросервисов: соло-разработке это не нужно.
2. **Контракт-first.** Сначала типы и схемы (`packages/shared`), потом реализация. Любой агент работает по контракту, а не по догадкам.
3. **Один writer на файл.** Два харнеса не редактируют один и тот же файл одновременно.
4. **Документация = часть кода.** Задача без обновлённых документов не считается выполненной.
5. **Приватность по умолчанию.** ПДн не попадают в логи, аналитику и внешние API без необходимости.
6. **Простота важнее красоты.** Всё, что можно не строить в MVP, — не строим.

---

## 2. Структура репозитория

```
repo/
├── apps/
│   ├── web/                  # Next.js App Router: UI, tRPC, /admin
│   └── worker/               # BullMQ: напоминания, отчёты, платежи, транскрибация
├── packages/
│   ├── core/                 # домены: auth, chat, memory, diary, programs, billing, safety, notifications, analytics
│   ├── db/                   # схема Drizzle, миграции, сиды, репозитории
│   ├── llm/                  # адаптер провайдеров
│   ├── shared/               # zod-схемы, типы API, константы, коды ошибок
│   └── ui/                   # компоненты
├── infra/                    # docker-compose, Caddy/nginx, деплой, бэкапы, мониторинг
├── docs/
│   ├── prd.md                # продукт, объём MVP, метрики
│   ├── adr/                  # архитектурные решения (0001-stack.md и далее)
│   ├── specs/                # контракты доменов
│   ├── runbooks/             # деплой, бэкапы, инциденты
│   └── DEFINITION_OF_DONE.md
├── tasks/                    # задачи для AI-агентов (шаблон + текущие)
├── tests/                    # e2e и интеграционные
├── AGENTS.md                 # главный документ для любого AI-агента
├── CLAUDE.md -> AGENTS.md    # совместимость
├── .env.example
└── README.md
```

Правила границ:
- `core` не знает про Next.js и React;
- `web` не ходит в БД напрямую — только через `core`/репозитории;
- `llm` не знает про домены — только сообщения, роли, опции;
- `shared` — единственный источник типов API.

Проверка: линтер `import/no-restricted-paths` (или аналог) на CI.

---

## 3. Домены и ответственность

| Домен | Сущности | Ответственность |
|---|---|---|
| **auth** | User, Session, AuthToken | вход по magic-link/OTP, сессии, роли, 18+ |
| **chat** | ChatThread, Message | диалог, стриминг, контекст, лимиты, удаление |
| **memory** | MemoryFact, MemorySource | извлечение и хранение фактов, версии, «что AI помнит» |
| **diary** | DiaryEntry, DiaryAttachment, Transcription | текст/голос, шифрование, поиск, экспорт |
| **programs** | Program, ProgramDay, Enrollment, Progress | контент 7 дней, запись, прогресс, отчёт |
| **billing** | Plan, Subscription, Payment, Entitlement | ЮKassa, разовые покупки, подписка, доступ |
| **safety** | SafetyEvent, SafetyRule | кризисный протокол, эскалация, стоп-сценарии |
| **notifications** | Notification, DeliveryLog, Preference | напоминания, каналы, тишина |
| **analytics** | Event, FunnelReport | продуктовые события, только агрегаты |
| **admin** | AdminUser, AuditLog, FeatureFlag | доступ, действия, эксперименты |

---

## 4. Модель данных (сущности и связи)

```
users (id, email/phone, status, consent_version, age_confirmed)
  ├── sessions (user_id, expires_at)
  ├── subscriptions (user_id, plan_id, status, period_start, period_end)
  ├── payments (user_id, subscription_id?, amount, provider_payment_id, status)
  ├── enrollments (user_id, program_id, current_day, started_at, finished_at)
  │     └── enrollment_progress (enrollment_id, day_num, completed_at)
  ├── chat_threads (user_id, title, created_at)
  │     └── messages (thread_id, role, content_enc, tokens, safety_flag, created_at)
  ├── memory_facts (user_id, fact_enc, source_message_id, confidence, deleted_at)
  ├── diary_entries (user_id, date, text_enc, audio_key, transcript_enc)
  ├── safety_events (user_id, severity, trigger, action, reviewed_by, created_at)
  └── events (user_id?, name, props jsonb, ts)  # партиционирование по месяцам
```

Общие правила: uuid, `created_at/updated_at`, soft-delete + джоб анонимизации, шифрование чувствительных полей, `audit_log` append-only.

Контент программ — seed-файлы (markdown/json) в репозитории, а не в админке на старте: так проще версионировать и ревьюить.

---

## 5. API

Приложение — tRPC; вебхуки — REST.

**Auth:** `auth.magicLink`, `auth.verify`, `auth.logout`.
**Chat:** `chat.start`, `chat.stream` (SSE), `chat.history`, `chat.delete`.
**Memory:** `memory.list`, `memory.update`, `memory.delete`.
**Diary:** `diary.create`, `diary.update`, `diary.uploadUrl`, `diary.export`.
**Programs:** `programs.list`, `programs.get`, `programs.enroll`, `programs.progress`, `programs.report`.
**Billing:** `billing.plans`, `billing.checkout`, `billing.portal`, `POST /webhooks/yookassa`.
**Notifications:** `notifications.settings`.
**Me:** `me.export`, `me.delete`.
**Admin:** `admin.users.search`, `admin.payments.refund`, `admin.safety.queue`, `admin.flags.set`.

Ответы — только через zod-схемы из `packages/shared`. Ошибки — единый формат с кодом и человекочитаемым текстом.

---

## 6. LLM-адаптер

Интерфейс:
```
chat(messages, opts) -> AsyncIterable<Chunk>   # стриминг
embed(texts) -> number[][]
moderate(text) -> ModerationResult
```

Реестр провайдеров (конфиг + feature flag):
- `foreign` — зарубежный API (прототип, синтетика);
- `yandex` / `gigachat` / `cloudru` — российские API (production);
- `local` — self-hosted open weights (позже);
- `fake` — детерминированные ответы для тестов.

Обязательные обёртки:
- таймауты, 2 ретрая с джиттером, circuit breaker;
- fallback-цепочка провайдеров (например, `yandex → foreign` только для не-ПДн сценариев);
- лимит токенов на фичу (чат, память, отчёт);
- редекция ПДн перед отправкой (имена, телефоны, адреса → плейсхолдеры), где это не ломает смысл;
- логирование: `request_id`, провайдер, модель, latency, tokens, cost, hash промпта — **без текста и ПДн**;
- версии промптов в `core/prompts/` с id; смена — через ADR;
- таблица цен в конфиге, учёт расходов в `events`;
- контрактные тесты гоняются на `fake` и на реальном провайдере.

Правило: **ни один домен не импортирует SDK провайдера напрямую** — только `packages/llm`.

---

## 7. Безопасность и приватность в коде

- Шифрование полей AES-GCM; ключи из env/KMS; отдельные ключи для чата и дневника.
- PII не пишется в логи, Sentry, аналитику; в событиях — только id и агрегаты.
- Удаление: soft-delete → джоб анонимизации ≤ 30 дней; экспорт — JSON + текст.
- Доступ: RBAC, проверка владельца в каждом резолвере (единый guard), админка — 2FA.
- Rate limiting: per-IP и per-user; отдельно на LLM, auth и отправку кода.
- Квоты по тарифу: сообщения/день, программы, токены.
- Секреты только в env, `.env.example` без значений.
- Бэкапы — в РФ, шифрованные; проверка восстановления раз в месяц.
- Safety: правила + очередь ручной проверки инцидентов; без ML на старте.

---

## 8. Процесс с двумя AI-харнесами

Артефакты в репозитории (обязательные):
- `AGENTS.md` — стек, команды, границы, стиль, запреты, как запускать тесты;
- `docs/DEFINITION_OF_DONE.md` — что считается готовой задачей;
- `docs/adr/NNNN-*.md` — архитектурные решения;
- `docs/specs/<домен>.md` — контракт, сущности, сценарии;
- `tasks/<id>.md` — цель, scope, acceptance, файлы, owner, статус;
- `.env.example`, миграции, тесты.

Правила:
1. Один writer на файл. `packages/shared` и миграции меняет только интегратор (основатель), по одному изменению за раз.
2. Каждая задача — вертикальный срез на 1–3 дня, атомарная, с acceptance-критериями.
3. Git worktree на задачу (`wt/<task-id>`), ветка `feat/<task-id>`, PR, ревью вторым агентом, squash.
4. Контракт-first: сначала типы в `shared`, потом реализация.
5. После merge — обновить `tasks/` и, если менялось решение, добавить ADR.
6. Если агент не уверен — он пишет вопрос в `tasks/<id>.md`, а не придумывает.

Разделение ролей (пример):
- Hermes — бэкенд, инфраструктура, платежи;
- DeepSeek Harness — фронтенд, контент, тесты;
- на ревью меняются.

---

## 9. План на 6–8 недель

| Неделя | Что делаем | Результат |
|---|---|---|
| 0 | Документы, ADR-стек, скелет репо, CI, staging | репозиторий и процесс |
| 1 | auth, users, БД, LLM-адаптер, чат со стримингом | можно поговорить с AI |
| 2 | память (факты), дневник (текст) | продукт помнит и ведёт дневник |
| 3 | голос (запись + асинхронная транскрибация), safety-протокол | можно говорить, есть защита |
| 4 | программа 7 дней, enrollment, прогресс | программа работает |
| 5 | ЮKassa: разовая покупка, подписка, entitlements, paywall | можно заплатить |
| 6 | воркеры/напоминания, админка, аналитика | продукт автоматизирован |
| 7 | закрытая бета, экспорт/удаление, нагрузка, юр. документы | 20–50 пользователей |
| 8 | буфер, релиз, runbook инцидентов | публичный запуск |

Упрощения на MVP:
- админка — route group внутри `apps/web`, не отдельное приложение;
- без своего auth-сервера — magic-link + сессии;
- голос — запись + асинхронная транскрибация, не realtime;
- контент программ — seed-файлы;
- сначала разовые покупки, подписка — после подтверждения спроса;
- self-host LLM — только через адаптер и позже;
- safety — правила + ручная очередь, без ML.

---

## 10. Документы, которые создать первыми

1. `AGENTS.md` + `docs/DEFINITION_OF_DONE.md`.
2. `docs/adr/0001-stack-and-boundaries.md`.
3. `docs/specs/domains.md` — границы и модель данных.
4. `tasks/README.md` + шаблон задачи.
5. `.env.example` + `infra/docker-compose.yml`.
6. `docs/runbooks/deploy-backup.md`.
7. `docs/prd.md` — объём MVP и метрики беты.

---

## 11. Риски

| Риск | Что делать |
|---|---|
| Зависимость от зарубежного LLM | адаптер + российский провайдер до публичного запуска |
| Стоимость токенов/голоса | лимиты, кэширование, дешёвая модель для рутины |
| Качество памяти и галлюцинации | маленькие факты, confidence, «что AI помнит», тесты |
| Краевые случаи ЮKassa (возвраты, рекурренты) | тестовый магазин, идемпотентность, вебхуки |
| Ответственность кризисного протокола | правила, контакты помощи, логирование без содержания, юрист |
| Bus factor соло | документация, ADR, tasks, простые технологии |
