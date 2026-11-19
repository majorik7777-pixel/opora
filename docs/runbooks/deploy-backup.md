# Runbook: деплой и резервное копирование

Версия 1.0 · 19.11.2026 · Статус: черновик для Phase 0–1

Короткий runbook для одного разработчика: как выкатить «Опору» на VPS в РФ, применить миграции и настроить ежедневные шифрованные бэкапы PostgreSQL с проверкой восстановления. Конкретные IP, домены, провайдеры и доступы здесь **не выдумываются** — они задаются основателем на сервере и не хранятся в репозитории.

Связанные документы: [`docs/adr/0002-dev-database-pglite.md`](../adr/0002-dev-database-pglite.md), [`docs/adr/0003-auth-encryption-and-consents.md`](../adr/0003-auth-encryption-and-consents.md), [`AGENTS.md §13`](../../AGENTS.md).

---

## 0. Границы runbook'а

- Покрывает: веб-приложение `apps/web` на VPS в РФ, PostgreSQL 16, Caddy, миграции, бэкапы, логи.
- Не покрывает пока: BullMQ-воркер, Redis, S3 (голос), бесшовный zero-downtime, автоскейлинг, мониторинг/Sentry, CI-CD-автодеплой. Появятся позже отдельными шагами.
- На Phase 0–1 достаточно одного сервера: приложение + PostgreSQL на нём же (или managed PostgreSQL в РФ — тогда `DATABASE_URL` указывает на него, а локальный контейнер не нужен).

## 1. Топология и предусловия

```
Интернет → DNS (A-запись домена) → Caddy (443, TLS) → Next.js (localhost:3000)
                                                       → PostgreSQL 16 (localhost:5432)
```

Предусловия (заполняет основатель):

- [ ] VPS в РФ с публичным IPv4 (и IPv6, если есть), ОС — актуальный LTS-дистрибутив.
- [ ] DNS: A-запись `<домен>` указывает на сервер; TTL можно уменьшить на время переключения.
- [ ] SSH-доступ по ключу, отдельный непривилегированный пользователь, `sudo` (без входа root по паролю).
- [ ] Firewall: открыты только 22 (или нестандартный SSH), 80, 443; PostgreSQL **не** смотрит в интернет.
- [ ] Node.js 22 и pnpm 10 на сервере (`corepack enable` либо установка pnpm 10).
- [ ] Caddy установлен ([`infra/Caddyfile`](../../infra/Caddyfile)).
- [ ] Репозиторий склонирован на сервер; `.env` создан на сервере, не в git.

## 2. Production-конфигурация `.env`

Файл — на сервере, права `600`, владелец — пользователь приложения. Шаблон — `.env.example`.

Обязательно:

```bash
APP_URL=https://<домен>
NEXT_TELEMETRY_DISABLED=1

DATABASE_DRIVER=postgres
DATABASE_URL=postgres://<пользователь>:<пароль>@<хост>:5432/<база>
AUTO_MIGRATE=false            # миграции применяются отдельно: pnpm db:migrate

AUTH_SECRET=<случайная строка, сгенерирована на сервере>
ENCRYPTION_KEY=<base64 32 байта: openssl rand -base64 32>

EMAIL_TRANSPORT=console       # пока письма не отправляются; для беты нужен SMTP
AUTH_DEV_SHOW_LINK=false      # dev-ссылка в production запрещена

LLM_PROVIDER=fake             # реальный провайдер — T-101, только контур РФ (D-010)
LLM_API_KEY=
LLM_BASE_URL=
```

Позже добавятся: `YOOKASSA_SHOP_ID`/`YOOKASSA_SECRET_KEY` (T-104), `REDIS_URL` (воркер), `SMTP_*` (письма), ключи S3 (голос). Все они — только в `.env` на сервере.

Правила секретов:

- `.env` не попадает в git, бэкапы кода и CI.
- `AUTH_SECRET` и `ENCRYPTION_KEY` хранятся в менеджере секретов (или офлайн-хранилище) отдельно от сервера; потеря `ENCRYPTION_KEY` = невозможность расшифровать email/ответы онбординга (ADR-0003).
- При смене `AUTH_SECRET` меняются HMAC-отпечатки email/IP — нужен план миграции; при смене `ENCRYPTION_KEY` — перешифровка данных. Делать только по отдельной задаче.

## 3. Деплой (вариант A: systemd + pnpm)

Основной вариант Phase 0–1: приложение запускается как процесс Node.js, Caddy стоит перед ним.

```bash
# на сервере, в каталоге приложения
cd <каталог-приложения>
git pull --ff-only
pnpm install --frozen-lockfile
pnpm build

# миграции — ДО перезапуска приложения, после бэкапа (см. §4)
set -a; . ./.env; set +a
pnpm db:migrate

sudo systemctl restart opora-web
curl -fsS https://<домен>/api/health
```

Пример unit-файла `/etc/systemd/system/opora-web.service` (пути/пользователя подставить):

```ini
[Unit]
Description=Opora web (Next.js)
After=network.target

[Service]
Type=simple
User=<пользователь>
WorkingDirectory=<каталог-приложения>
EnvironmentFile=<каталог-приложения>/.env
ExecStart=/usr/bin/env pnpm start
Restart=on-failure
RestartSec=5
# PGlite в production не используется; БД — PostgreSQL по DATABASE_URL.
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

Проверки после деплоя:

- [ ] `curl -fsS https://<домен>/api/health` → 200.
- [ ] Лендинг открывается по https, сертификат валиден.
- [ ] Вход по magic-link в smoke-режиме (при включённом SMTP; иначе — лендинг и `/app` без входа — редирект на `/auth`).
- [ ] В логах нет ошибок миграций/подключения к БД; ПДн в логах нет.

Вариант B (позже): Docker Compose + Caddy + Dockerfile приложения. `infra/docker-compose.yml` уже содержит PostgreSQL 16 и Redis 7 с healthcheck и named volumes; Dockerfile веб-приложения появится позже — до этого вариант B не считать готовым.

## 4. Миграции и откат

- Схема БД — Drizzle, runtime-миграции Phase 0–1 встроены в `packages/db/src/migrations.ts` (файловый раннер — при росте схемы). Production: `AUTO_MIGRATE=false`, миграции запускаются вручную `pnpm db:migrate` с production-`DATABASE_URL`.
- Перед миграцией — **свежий бэкап** (§5). Миграции forward-only: откат кода без отката схемы возможен не всегда; основной план восстановления — восстановить БД из бэкапа.
- Миграции должны быть безопасными для rolling-деплоя: сначала добавить колонку/таблицу, потом использовать; удаление — после того как код перестал её использовать.
- Проверка миграций до production: прогонять на копии БД/на PGlite в CI; миграция «с нуля» должна проходить.

## 5. Резервное копирование

Требования: ежедневный бэкап PostgreSQL, **шифрование**, хранение не на том же диске/сервере, retention 30 дней, ежемесячная проверка восстановления. Данные — в РФ; хранилище бэкапов тоже в РФ.

Ежедневный дамп (cron, пример; пути/имена — подставить):

```bash
#!/usr/bin/env bash
set -euo pipefail
umask 077

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_DIR="<каталог-бэкапов>"
DATABASE_URL="<production DATABASE_URL>"

# custom-format удобнее для восстановления; -Fc + сжатие
pg_dump --format=custom --no-owner --no-privileges "$DATABASE_URL" \
  > "$BACKUP_DIR/opora-$STAMP.dump"

# Шифрование: GPG (получатель — ключ бэкапов) или openssl.
# Ключ/пароль хранится ОТДЕЛЬНО от сервера и бэкапов.
gpg --batch --yes --encrypt --recipient <ключ-бэкапов> \
  --output "$BACKUP_DIR/opora-$STAMP.dump.gpg" \
  "$BACKUP_DIR/opora-$STAMP.dump"
rm -f "$BACKUP_DIR/opora-$STAMP.dump"

# Копирование в хранилище вне сервера (S3-совместимое в РФ / другой сервер)
# aws s3 cp ... или rclone/rsync — по выбранному хранилищу.

# Retention: 30 дней
find "$BACKUP_DIR" -name 'opora-*.dump.gpg' -mtime +30 -delete
```

Вариант с `openssl` (если GPG не используется): `openssl enc -aes-256-cbc -pbkdf2 -salt -pass file:<файл-пароля>` — тот же принцип, ключ отдельно.

Проверки:

- [ ] Cron настроен, письмо/алерт при падении бэкапа (`MAILTO` или внешняя проверка).
- [ ] Бэкап копируется за пределы сервера; доступ к хранилищу — по отдельным ключам.
- [ ] **Раз в месяц** — проверка восстановления: развернуть пустую БД, восстановить дамп (`pg_restore --clean --if-exists`), проверить ключевые таблицы (`users`, `consents`, `onboarding_answers`), поднять приложение на копии и пройти smoke-сценарий. Результат — запись в журнале проверок (дата, кто, что восстановлено, время).
- [ ] Отдельно проверяется, что `ENCRYPTION_KEY`/`AUTH_SECRET` доступны при восстановлении (без них данные не расшифруются).

## 6. Логи и наблюдаемость

- Приложение (systemd): `journalctl -u opora-web -f`, ротация — средствами systemd/journald.
- Caddy: `/var/log/caddy/access.log` и `error.log` (пути зависят от дистрибутива; настроить ротацию).
- PostgreSQL: `log_directory`/`log_filename` в конфиге; ошибки подключения и миграций искать там.
- **ПДн не логируются**: в логах только id, коды ошибок, латентность; текст переписки/дневника и email — нет (ADR-0003).
- Sentry/структурные логи — позже, отдельной задачей; при подключении обязательно настроить `beforeSend`-фильтрацию ПДн.
- Healthcheck: `GET /api/health`; для внешнего мониторинга — любой сервис, который дёргает URL и алертит (выбор — позже).

## 7. Типовые инциденты

| Симптом | Что проверить | Действие |
|---|---|---|
| 502/504 от Caddy | процесс `opora-web`, порт 3000 | `systemctl status opora-web`, логи, перезапуск; если не поднимается — откат кода/восстановление из бэкапа |
| 500 на всех страницах | `.env` (валидация env), подключение к БД | сверить `DATABASE_URL`, права, миграции; `pnpm db:migrate` после бэкапа |
| Ошибка миграции при деплое | версия схемы, локи | остановить деплой, восстановить БД из бэкапа, исправить миграцию в новой задаче |
| Сертификат не обновляется | DNS, 80/443, логи Caddy | проверить A-запись и доступность 80; `caddy validate` |
| Подозрение на утечку ПДн | логи доступа, изменения в коде | изолировать сервер, сохранить логи, сменить ключи (по плану), уведомить по регламенту 152-ФЗ (`08-legal-pdn.md`) |

## 8. Чек-лист первого деплоя

- [ ] DNS-запись указывает на сервер; 80/443 открыты.
- [ ] `pnpm install --frozen-lockfile`, `pnpm verify` на сервере/в CI зелёные.
- [ ] `.env` создан на сервере с правами 600, секреты сгенерированы, `AUTO_MIGRATE=false`.
- [ ] PostgreSQL 16 поднят (или managed), `DATABASE_URL` проверен, миграции применены.
- [ ] Caddy настроен, https работает, security-заголовки на месте.
- [ ] `pnpm build` и `systemctl restart opora-web`; `/api/health` → 200.
- [ ] Бэкап настроен, зашифрован, скопирован вне сервера; проверка восстановления запланирована.
- [ ] Логи проверены на отсутствие ПДн; доступ root/пароли не используются.
