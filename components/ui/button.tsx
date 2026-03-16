import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-primary)] text-white shadow-sm hover:bg-[#173a33]",
  secondary:
    "bg-[var(--color-surface-muted)] text-slate-900 ring-1 ring-[var(--color-border)] hover:bg-[#efe6d7]",
  ghost: "bg-transparent text-slate-700 hover:bg-white/60",
  danger: "bg-[var(--color-danger)] text-white hover:bg-[#982f2f]",
};

export function buttonClassName(variant: Variant = "primary") {
  return cn(
    "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
  );
}

export function Button({
  className,
  variant = "primary",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <button
      className={cn(buttonClassName(variant), className)}
      {...props}
    >
      {children}
    </button>
  );
}
