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
        "surface animate-enter rounded-3xl border border-[var(--color-border)] p-4 shadow-[0_20px_60px_rgba(23,32,51,0.06)] md:p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}
