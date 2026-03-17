import { CalendarDays, ChevronRight, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUserProfile } from "@/lib/auth";
import { signOutAction } from "@/lib/actions";

export async function TopHeader({
  title,
  subtitle,
  showSignOut,
}: {
  title: string;
  subtitle: string;
  showSignOut: boolean;
}) {
  const today = new Intl.DateTimeFormat("en-SG", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());
  const profile = await getCurrentUserProfile();

  return (
    <header className="flex flex-col gap-5 rounded-[28px] border border-[var(--color-border)] bg-white/90 p-5 shadow-[var(--shadow-soft)] lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          <span>Dashboard</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-500">{title}</span>
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">
          {title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{subtitle}</p>
      </div>

      <div className="flex flex-col gap-3 lg:min-w-[320px] lg:items-end">
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:justify-end">
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <CalendarDays className="h-4 w-4" />
            <span>{today}</span>
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

        <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-slate-50 px-4 py-3">
          <div className="rounded-2xl bg-sky-600 p-2 text-white">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">
              {profile?.full_name || "Manager"}
            </p>
            <p className="text-xs text-slate-500">
              {(profile?.role ?? "admin").replace("_", " ")}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
