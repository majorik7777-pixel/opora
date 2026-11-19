import { cn } from "./cn";

export interface ProgressBarProps {
  /** Значение 0–100. */
  value: number;
  /** Обязательная текстовая подпись для скринридеров. */
  ariaLabel: string;
  className?: string;
}

export function ProgressBar({ value, ariaLabel, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-label={ariaLabel}
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-line",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-moss transition-[width] duration-500 ease-out motion-reduce:transition-none"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
