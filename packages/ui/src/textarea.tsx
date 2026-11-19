import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "./cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, hint, error, className, id, ...props }, ref) {
    if (!id) {
      throw new Error("Textarea: обязательный id нужен для связки label/aria");
    }

    const hintId = hint ? `${id}-hint` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className={cn("space-y-2", className)}>
        <label htmlFor={id} className="block text-sm font-medium text-ink">
          {label}
        </label>
        <textarea
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            "min-h-32 w-full rounded-field border border-line bg-surface px-4 py-3 text-base leading-6 text-ink",
            "placeholder:text-muted/70",
            "focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40",
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
  },
);
