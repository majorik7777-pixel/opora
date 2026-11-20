# Спецификация: оплата и доступ

Версия 0.9 · 20.11.2026 · Статус: DEV-режим (T-104, первый шаг). ЮKassa, вебхук и чеки — дальше.

Контракт: режимы оплаты, что покупается, как выдаётся доступ, страницы, идемпотентность, ошибки.
Код: [`packages/core/src/billing.ts`](../../packages/core/src/billing.ts),
[`packages/db/src/repositories/entitlements.ts`](../../packages/db/src/repositories/entitlements.ts).

---

## 1. Режимы

| `PAYMENTS_MODE` | Поведение |
|---|---|
| `dev` | `/paywall` показывает кнопку «Открыть доступ — DEV-режим»; доступ выдаётся сразу, деньги не списываются, `source = dev` |
| `off` | форма скрыта, вместо неё «Оплата пока недоступна»; `startDevPurchase` возвращает `CONFLICT` |

По умолчанию: `dev` в dev/test, `off` в production (чтобы случайно не открыть платный контент).

## 2. Что покупается

Программа (сейчас «Пережить расставание», `program_slug = rasstavanie`), 990 ₽ разово, доступ
навсегда. Подписки нет (D-004/D-007).

## 3. Поток

1. `/app/program` — если доступа нет: «Открыть доступ за 990 ₽» → `/paywall`.
2. `/paywall` — цена, состав, возврат, кнопка (в DEV — сразу выдаёт доступ).
3. Серверное действие `purchaseDevAction` → `startDevPurchase` → запись в `entitlements`.
4. Редирект на `/welcome/purchase` — страница успеха, она же URL-цель в Метрике.
5. `/app/program` показывает «Доступ открыт · оплачено».
6. Повторный заход на `/paywall` при активном доступе → редирект в `/app/program`.

## 4. Данные

`entitlements`: `id`, `user_id`, `program_slug`, `status` (`active`), `source` (`dev` | `yookassa`),
`external_id` (id платежа), `created_at`. Уникальный индекс `(user_id, program_slug)` — повторная
покупка не создаёт дубль. Удаление пользователя удаляет доступ (cascade).

## 5. Что появится с ЮKassa

- `payments`: `id`, `user_id`, `amount`, `currency`, `status`, `external_id`, `receipt`, `created_at`.
- `POST /api/webhooks/yookassa`: проверка IP/подписи, идемпотентность по `external_id`,
  `payment.succeeded` → `grantEntitlement(source=yookassa)`; `payment.canceled` → ничего.
- Чеки: 54-ФЗ через ЮKassa (в DEV чек не формируется — это указано в интерфейсе).
- Возвраты: вручную в кабинете, статус `refunded` в `entitlements`.

## 6. Открытые вопросы

- Нужен ли trial-доступ ко 2-му дню без оплаты (сейчас бесплатен только 1-й день).
- Промокоды и подарочные доступы — после первых 100 продаж.
- Как считать возвраты в Метрике (сейчас цель только на успешную оплату).
