# Деплой тестовой версии (домен + GitHub)

Дата: 19.11.2026 · Для тестового контура. **Реальные ПДн на тестовом домене не собираем.**

## 1. Домен

Рекомендация: **`opora-psihologii.ru`** (свободен на 19.11.2026) как основной. Защитный:
**`опора.рф`** (свободен) с 301 на основной. Регистратор: REG.RU / Timeweb / Beget (для .ru нужен
паспорт, домен на физлицо). Купить сразу на 2 года, включить автопродление.

DNS (пример):
```
@    A       <IP VPS>
www  CNAME   opora-psihologii.ru.
```

## 2. GitHub

```bash
# из корня opora/
git remote add origin git@github.com:<user>/opora.git
git branch -M main
git push -u origin main
```

- `.env` и `.data/` в `.gitignore` — не коммитить. Секреты — только в GitHub Secrets (позже).
- CI уже есть: `.github/workflows/ci.yml` (lint → typecheck → test → build → e2e chromium).
- После пуша проверить Actions; e2e в CI использует chromium, локально — Chrome.

## 3. Тестовый деплой: вариант A (рекомендуется для РФ)

VPS в РФ (Timeweb/Beget/Selectel, 2 vCPU / 2–4 ГБ), Ubuntu 24.04, Docker или Node 22 + pnpm.

```bash
# на сервере
git clone git@github.com:<user>/opora.git && cd opora
cp .env.example .env && nano .env   # заполнить секреты, APP_URL=https://opora-psihologii.ru
pnpm install --frozen-lockfile
pnpm build
DATABASE_DRIVER=postgres DATABASE_URL=... AUTO_MIGRATE=false pnpm db:migrate
pnpm --filter @opora/web start   # или systemd-сервис
```

Caddy (`/etc/caddy/Caddyfile`):
```
opora-psihologii.ru {
    basic_auth {
        test <bcrypt-hash>
    }
    reverse_proxy 127.0.0.1:3000
    header X-Robots-Tag "noindex, nofollow"
}
```
`basic_auth` и `X-Robots-Tag` — обязательны для теста; после снятия — публичный запуск только
после юридического чек-листа (РКН, согласия, хостинг в РФ, SMTP).

База: PostgreSQL 16 (`infra/docker-compose.yml`) или PGlite для быстрого теста (PGlite на одном
инстансе, данные в `.data/`; для теста ок, для продакшена — Postgres).

## 4. Вариант B: Vercel (быстро, только синтетика)

- Плюсы: preview-ссылки, HTTPS, Git-интеграция.
- Минусы: PGlite не персистентна (сессии/пользователи теряются), magic-link пишется в логи,
  зарубежный хостинг — **нельзя реальные ПДн** (152-ФЗ, D-010/D-032).
- Обязательно: Deployment Protection (пароль), `noindex`, баннер «тестовая версия», синтетические
  данные. Для настоящего продукта — только РФ-хостинг.

## 5. Юридический гейт перед публичным запуском

- [ ] Уведомление РКН об обработке ПДн (спец. категория).
- [ ] Форма согласия на спец. категорию согласована с юристом (D-032).
- [ ] Договоры поручения: хостинг РФ, LLM-провайдер РФ, почтовый сервис, платёжка.
- [ ] Политика/оферта с реквизитами оператора, возвраты по ст. 32 ЗоЗПП.
- [ ] SMTP (сейчас `console` — письма в лог).
- [ ] Кризисный протокол и телефоны в UI (T-105).
- [ ] Отзывы/доказательства — только реальные и с согласием (см. HANDOFF).

## 6. Smoke после деплоя

```bash
curl -fsS https://opora-psihologii.ru/api/health
# ожидаем {"status":"ok","db":"ok"}
pnpm exec playwright test   # локально против APP_URL/e2e или вручную пройти путь
```
