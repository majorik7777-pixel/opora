import type { ReactNode } from "react";
import { cn } from "./cn";

export interface CardProps {
  children: ReactNode;
  className?: string;
  /** Плотная карточка для списков/быстрых действий. */
  padded?: boolean;
}

export function Card({ children, className, padded = true }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-surface shadow-soft",
        padded && "p-5 sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
