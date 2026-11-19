# Скиллы и инструменты: чем решать «нейрослоп»

Дата: 19.11.2026 · Исследование под редизайн «Опоры»

## 1. Скиллы для AI-агентов (что именно решают)

| Скилл | Где | Лицензия | Что решает | Как использовать |
|---|---|---|---|---|
| **frontend-design** (официальный Anthropic) | [github.com/anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | проприетарная лицензия Anthropic (см. LICENSE) | Процесс «арт-директор»: план токенов → ревью на дефолтность → сборка → критика; список AI-телле́й (включая крем+терракота+сериф — наш случай) | Прочитать SKILL.md, применять как процесс; можно скопировать в `.agents/skills/` |
| **Hallmark** | [github.com/nutlope/hallmark](https://github.com/nutlope/hallmark) · [usehallmark.com](https://www.usehallmark.com) | MIT | 50 «материалов» (тем), `sloplint` — линтер AI-телле́й в реальном браузере, redesign/audit, «floor/reflex/finish» гейты | `npx skills add nutlope/hallmark` (в проект) или вручную: взять `skills/hallmark`; прогонять `sloplint` на страницах |
| **Taste Skill** (`design-taste-frontend`) | [github.com/Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) · [tasteskill.dev](https://tasteskill.dev) | MIT | Арт-дирекшн из 247 проверенных сайтов, палитры/пары шрифтов, 11 типов hero, проверка в headless Chrome на 1440/1024/768/390 | `npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"` |
| **StyleSeed** | [github.com/bitjaru/styleseed](https://github.com/bitjaru/styleseed) | MIT | 74 правила дизайна, 8 «грамматик», токены/скины, гейт 0–100, `DESIGN.md`-замок от дрейфа между экранами; ретрофит существующего UI | `npx -y skills add bitjaru/styleseed -a codex claude-code -y --copy` (для нас — взять правила/гейты вручную) |
| **Emil Kowalski skills** | [github.com/emilkowalski/skills](https://github.com/emilkowalski/skills) · [aiforui.dev/skills](https://aiforui.dev/skills) | MIT | Движение/микроинтеракции «как в Vercel/Linear»: easing, длительности, `prototype`, `break-ui`, `learn-taste` (записывает правки в DESIGN.md) | `npx skills@latest add emilkowalski/skills` |
| **ui-ux-pro-max-skill** | [github.com/nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | MIT | «Дизайн-интеллект» для UI/UX на разных платформах (полезно как справочник паттернов) | `npx skills add nextlevelbuilder/ui-ux-pro-max-skill` |
| **unslop** | [github.com/heydamir/unslop](https://github.com/heydamir/unslop) | CC-BY-4.0 | Превращает «вайбкод» в осмысленный интерфейс, чистит AI-телли | как аудит-скилл для существующих экранов |
| **oil-ui / styleseed / qiaomu-design** | GitHub (см. `references`) | MIT | Альтернативные «дизайн-агенты»: сравнение направлений бок о бок, 58 реальных дизайн-систем | для генерации вариантов на этапе концепта |
| **Vercel Web Interface Guidelines** | [github.com/vercel-labs/web-interface-guidelines](https://github.com/vercel-labs/web-interface-guidelines) | MIT | Не вкус, а floor: клавиатура, фокус, формы, состояния, движение, a11y, производительность | `AGENTS.md`/правила проекта; уже частично в наших DoD |
| **Anthropic cookbook: frontend aesthetics** | [platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics) | — | Первоисточник анти-слоп промпта | вставить в бриф/скилл |

**Что установлено в проект:** `.agents/skills/design-opora/SKILL.md` — собственный скилл «Опора»,
который DSH подхватывает из `<repo>/.agents/skills` (провайдер `dsh-skill-filesystem`). Он собирает
процесс и чек-лист из Anthropic frontend-design + Hallmark + Taste + Vercel, но с нашими бренд-рамками.
Внешние скиллы можно добавить рядом (`npx skills add ...` в проект) — они MIT, но требуют Node и
Chromium; ставить глобально в этой песочнице нельзя (запись вне workspace), поэтому — в проект.

**Рекомендуемый рабочий набор на редизайн:** frontend-design (процесс) + Hallmark `sloplint` (линт) +
Taste Skill (арт-дирекшн/фото) + Emil Kowalski (движение) + Vercel guidelines (floor) + StyleSeed
(консистентность после первой страницы).

## 2. Инструменты профессиональных дизайнеров/арт-директоров

| Инструмент | Зачем нам |
|---|---|
| **Figma** (variables, auto-layout, prototypes) | источник токенов и макетов; наш код должен повторять Figma-переменные 1:1 |
| **Are.na / Pinterest** | мудборды и насмотренность; Pinterest-поиски — в `../reports/design-research.md` |
| **siteinspire / Awwwards / Lapa Ninja / Godly** | отбор референсов по типу сайта, а не по «красивости» |
| **Mobbin / Refero** | библиотеки реальных экранов и флоу (онбординг, paywall, дневник) |
| **Fonts In Use / Typewolf** | как гарнитуры работают в реальных проектах; проверка пар |
| **Google Fonts / Contrast Foundry / TypeType / CSTM Fonts** | кириллица: Literata, Onest, IBM Plex Mono (free) → лицензионные Contrast/TypeType при росте бренда |
| **Wikimedia Commons / CC-фотобанки, фотограф** | арт-фото; Unsplash/Pexels не годятся для AI-подбора по ToS |
| **GSAP / Framer Motion / CSS** | один сценарий движения; для нашего стека — CSS + Web Animations, без тяжёлых библиотек |
| **APCA / WebAIM / axe DevTools** | контраст и доступность (AA — минимум, APCA — для проверки) |
| **Maze / UsabilityHub / реальные 5 женщин 28–40** | проверка экранов на аудитории (10-design §7) |
| **Style Dictionary / Tailwind @theme** | единый источник токенов в коде |
| **Playwright** | скриншоты 360/768/1440 и визуальные снапшоты в CI |

## 3. Как это связано с процессом редизайна

1. Концепт: 3 направления → выбрать (Twо Chairs/Clue/On Being как оси).
2. Токены: Figma-переменные → `globals.css`/`packages/ui` (T-201).
3. Страницы: редакционная сетка и фото (T-202/T-203).
4. Медиа: фотобриф/лицензия (T-204).
5. Проверка: скилл `design-opora` + `sloplint`-чек-лист + axe + скриншоты (T-205).

Источники скиллов проверены 19.11.2026; лицензии — по ссылкам репозиториев. Перед установкой
третьесторонних скиллов читать их SKILL.md и не давать им доступа к `.env`/БД.
