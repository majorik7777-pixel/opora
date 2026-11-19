# Фотографии лендинга «Опора» v3

Источник: сгенерированы основателем в ChatGPT Image по промптам
[`docs/design/photo-prompts.md`](../../../../docs/design/photo-prompts.md), 19.11.2026.

- WebP подготовлены скриптом (pre-sized 640/700/800/1000/1100/1200/1400/1600 px), `<img srcset>` в
  `apps/web/src/components/landing/photo.tsx`; next/image не используется.
- Кадры: `hero-morning` (слот 1), `quiet-room` («Если сейчас так»), `seven-days` (секция «7 дней»),
  `notebook` («Что внутри»), `final-window` (финальный CTA). `hero-hands`, `support`, `diary` — запас.
- Alt-тексты — в компонентах; при замене фото обновить alt и пропорции (`width`/`height`).
