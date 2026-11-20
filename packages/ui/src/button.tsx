import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "signal" | "paper";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  // Primary — чернильная кнопка: единственное сильное действие на экране.
  primary:
    "bg-ink text-white shadow-soft hover:bg-ink/90 active:bg-ink",
  // signal — янтарь: тёплый акцент для главного CTA, текст белый (5,3:1).
  signal:
    "bg-accent-strong text-white shadow-soft hover:brightness-105 active:brightness-95",
  // paper — кнопка на тёмном поле.
  paper:
    "bg-paper text-ink hover:bg-white active:bg-line",
  secondary:
    "border border-line bg-surface text-ink hover:border-ink/25 hover:bg-accent-soft/40",
  ghost: "text-ink hover:bg-line/40",
  danger: "bg-danger text-white hover:brightness-95 active:brightness-90",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4 text-sm",
  md: "min-h-12 px-5 text-base",
  lg: "min-h-14 px-6 text-base sm:text-lg",
};

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

/** Классы кнопки — чтобы стилизовать <a>/<Link> так же, как <button>. */
export function buttonStyles({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: ButtonStyleOptions = {}): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-button font-medium",
    "transition-[background-color,border-color,color,filter] duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    fullWidth && "w-full",
    className,
  );
}

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<ButtonStyleOptions, "className"> {
  className?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", fullWidth = false, className, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonStyles({ variant, size, fullWidth, className })}
      {...props}
    />
  );
});
