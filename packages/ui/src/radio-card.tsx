import { cn } from "./cn";

export interface RadioCardProps {
  name: string;
  value: string;
  label: string;
  checked: boolean;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Вариант ответа-карточка с нативным radio внутри.
 * Управляется клиентским компонентом (онбординг).
 */
export function RadioCard({
  name,
  value,
  label,
  checked,
  onChange,
  className,
}: RadioCardProps) {
  const inputId = `${name}-${value}`;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "group flex min-h-12 cursor-pointer items-center gap-3 rounded-field border p-4",
        "transition-colors duration-200",
        "focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-bg",
        checked
          ? "border-accent bg-accent-soft/60"
          : "border-line bg-surface hover:border-accent/50 hover:bg-accent-soft/20",
        className,
      )}
    >
      <input
        id={inputId}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          checked
            ? "border-accent-strong"
            : "border-line group-hover:border-accent/60",
        )}
      >
        {checked ? (
          <span className="size-2.5 rounded-full bg-accent-strong" />
        ) : null}
      </span>
      <span className="text-base leading-6 text-ink">{label}</span>
    </label>
  );
}
