import { cn } from "./cn";

/** Знак «Опора»: арка-опора и точка-горизонт. Абстрактно, без клише. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("size-7", className)}
    >
      <path
        d="M5 26c0-7.18 4.925-13 11-13s11 5.82 11 13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M10.5 26c0-4.05 2.462-7.2 5.5-7.2s5.5 3.15 5.5 7.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.45"
      />
      <circle cx="16" cy="6.5" r="2.2" fill="currentColor" opacity="0.7" />
    </svg>
  );
}

export interface LogoProps {
  className?: string;
  /** Скрыть wordmark (только знак). */
  markOnly?: boolean;
}

/** Логотип-словесный знак: подходит и для шапки, и для подвала. */
export function Logo({ className, markOnly = false }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className="text-moss" />
      {markOnly ? null : (
        <span className="text-xl font-medium leading-none tracking-[-0.02em] text-ink">
          Опора
        </span>
      )}
    </span>
  );
}
