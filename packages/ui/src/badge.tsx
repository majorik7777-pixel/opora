import type { ReactNode } from "react";
import { cn } from "./cn";

export type BadgeTone = "sage" | "accent" | "neutral";

const tones: Record<BadgeTone, string> = {
  sage: "bg-sage-soft text-sage-deep",
  accent: "bg-accent-soft text-accent-deep",
  neutral: "bg-line/40 text-ink/75",
};

export function Badge({
  children,
  tone = "sage",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium leading-none",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
