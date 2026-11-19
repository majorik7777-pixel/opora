import type { ReactNode } from "react";
import { cn } from "./cn";

/**
 * Дисклеймер «не медицина» (D-012, 11-copy.md §10).
 * Всегда мелкий, спокойный, без давления.
 */
export function Disclaimer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-xs leading-5 text-muted", className)}>{children}</p>
  );
}
