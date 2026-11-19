import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "./cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Подпись поля обязательна: форма без label не проходит доступность. */
  label: string;
  /** Подсказка под полем (не ошибка). */
  hint?: string;
  /** Текст ошибки; переводит поле в aria-invalid. */
  error?: string;
  /** Скрыть визуальную подпись (для случаев, когда она дублируется заголовком). */
  hideLabel?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, hideLabel = false, className, id, ...props },
  ref,
) {
  if (!id) {
    throw new Error("Input: обязательный id нужен для связки label/aria");
  }

  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={id}
        className={cn(
          "block text-sm font-medium text-ink",
          hideLabel && "sr-only",
        )}
      >
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "h-12 w-full rounded-field border border-line bg-surface px-4 text-base text-ink",
          "placeholder:text-muted/70",
          "focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
          "disabled:cursor-not-allowed disabled:bg-bg disabled:text-muted",
          error && "border-danger focus:border-danger focus-visible:ring-danger/30",
        )}
        {...props}
      />
      {hint && !error ? (
        <p id={hintId} className="text-sm leading-5 text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm leading-5 text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
});
