import type { ReactNode } from "react";
import { cn } from "./cn";

export type ContainerSize = "wide" | "narrow" | "prose";

const sizes: Record<ContainerSize, string> = {
  wide: "max-w-6xl",
  narrow: "max-w-2xl",
  prose: "max-w-3xl",
};

export function Container({
  children,
  size = "wide",
  className,
}: {
  children: ReactNode;
  size?: ContainerSize;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizes[size],
        className,
      )}
    >
      {children}
    </div>
  );
}
