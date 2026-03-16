import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "surface animate-enter rounded-[28px] border border-[var(--color-border)] p-5 shadow-[var(--shadow-soft)] md:p-6",
        className,
      )}
    >
      {children}
    </section>
  );
}
