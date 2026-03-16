import { CalendarDays, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/actions";

export function TopHeader({
  title,
  subtitle,
  showSignOut,
}: {
  title: string;
  subtitle: string;
  showSignOut: boolean;
}) {
  const today = new Intl.DateTimeFormat("en-SG", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="surface animate-enter flex flex-col gap-4 rounded-3xl border border-[var(--color-border)] p-4 md:p-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--color-accent)]">
          Internal Operations
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">{subtitle}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:self-start lg:self-auto">
        <div className="flex items-center gap-2 rounded-2xl bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-slate-700 ring-1 ring-[var(--color-border)]">
          <CalendarDays className="h-4 w-4" />
          <span className="truncate">{today}</span>
        </div>
        {showSignOut ? (
          <form action={signOutAction}>
            <Button variant="secondary" className="w-full gap-2 sm:w-auto">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        ) : null}
      </div>
    </header>
  );
}
