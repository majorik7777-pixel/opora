import type { ReactNode } from "react";
import { cn } from "./cn";

export interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Текст согласия (может содержать ссылки). */
  children: ReactNode;
  className?: string;
}

/** Нативный чекбокс: доступность и тач-зона ≥ 44px без кастомных ролей. */
export function Checkbox({
  id,
  checked,
  onChange,
  children,
  className,
}: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex min-h-11 cursor-pointer items-start gap-3 rounded-field px-1 py-2 text-sm leading-6 text-ink",
        "hover:bg-line/20",
        className,
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className={cn(
          "mt-0.5 size-5 shrink-0 cursor-pointer rounded border border-line accent-accent-strong",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        )}
      />
      <span>{children}</span>
    </label>
  );
}
