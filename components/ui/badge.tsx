import { cn } from "@/lib/utils";

const toneClasses = {
  neutral: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-rose-100 text-rose-800",
  accent: "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: string;
  tone?: keyof typeof toneClasses;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}
