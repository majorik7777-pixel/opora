/**
 * Абстрактная иллюстрация первого экрана: две вложенные арки (мотив логотипа),
 * линия горизонта, солнце в проёме и камни-опора. Никаких людей, сердец и слёз —
 * только органика и палитра из 10-design.md §3.4.
 * Декоративна: для скринридеров скрыта целиком.
 */
export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 560 520"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* Мягкие пятна палитры вместо фото: спокойное поле и тёплая дымка. */}
      <path
        d="M280 34C398 34 492 118 502 220c10 102-52 190-146 226-94 36-206 18-264-52-58-70-44-188 24-258C178 70 222 34 280 34Z"
        fill="var(--color-sage-soft)"
        opacity="0.55"
      />
      <circle cx="432" cy="128" r="112" fill="var(--color-accent-soft)" opacity="0.55" />

      {/* Проём арки чуть светлее фона — глубина без градиентов. */}
      <path
        d="M206 452V316a74 74 0 0 1 148 0v136Z"
        fill="var(--color-surface)"
        opacity="0.5"
      />

      {/* Линия горизонта. */}
      <path
        d="M64 352H496"
        stroke="var(--color-line)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Солнце садится на горизонт — видно сквозь арку. */}
      <circle cx="280" cy="344" r="58" fill="var(--color-accent-soft)" opacity="0.85" />
      <circle cx="280" cy="344" r="32" fill="var(--color-accent)" opacity="0.8" />

      {/* Внешняя и внутренняя арки — «опора» как дверь, а не как стена. */}
      <path
        d="M166 452V300a114 114 0 0 1 228 0v152"
        stroke="var(--color-sage)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M206 452V316a74 74 0 0 1 148 0v136"
        stroke="var(--color-accent)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.45"
      />

      {/* Земля и мягкая тень под аркой. */}
      <ellipse cx="280" cy="452" rx="136" ry="10" fill="var(--color-line)" opacity="0.55" />
      <path
        d="M64 452H496"
        stroke="var(--color-line)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Камни-опора слева: простая метафора устойчивости. */}
      <ellipse
        cx="104"
        cy="440"
        rx="44"
        ry="14"
        fill="var(--color-sage-soft)"
        stroke="var(--color-sage)"
        strokeWidth="1.4"
      />
      <ellipse
        cx="104"
        cy="414"
        rx="32"
        ry="11"
        fill="var(--color-surface)"
        stroke="var(--color-sage)"
        strokeWidth="1.4"
      />
      <ellipse
        cx="104"
        cy="393"
        rx="19"
        ry="7.5"
        fill="var(--color-accent-soft)"
        stroke="var(--color-accent)"
        strokeWidth="1.2"
      />

      {/* Пара камешков справа, чтобы композиция не была однобокой. */}
      <ellipse
        cx="464"
        cy="444"
        rx="18"
        ry="7.5"
        fill="var(--color-accent-soft)"
        stroke="var(--color-accent)"
        strokeWidth="1.2"
        opacity="0.55"
      />
      <ellipse
        cx="496"
        cy="451"
        rx="9"
        ry="4"
        fill="var(--color-sage-soft)"
        stroke="var(--color-sage)"
        strokeWidth="1.2"
        opacity="0.8"
      />

      {/* Тихие точки — воздух, без визуального шума. */}
      <circle cx="72" cy="236" r="5" fill="var(--color-accent-soft)" />
      <circle cx="126" cy="172" r="3" fill="var(--color-sage)" opacity="0.7" />
      <circle cx="476" cy="248" r="4" fill="var(--color-accent)" opacity="0.5" />
      <circle cx="458" cy="92" r="3" fill="var(--color-sage)" opacity="0.6" />
    </svg>
  );
}
