"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  CircleDollarSign,
  FileText,
  LayoutDashboard,
  Menu,
  X,
  Settings,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/helpers", label: "Helpers", icon: Users },
  { href: "/sales", label: "Sales", icon: BriefcaseBusiness },
  { href: "/documentation", label: "Documentation", icon: FileText },
  { href: "/finance", label: "Finance", icon: CircleDollarSign },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-40 p-4 lg:hidden">
        <div className="surface animate-enter flex items-center justify-between rounded-3xl border border-[var(--color-border)] px-4 py-3 shadow-[0_20px_50px_rgba(23,32,51,0.08)]">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--color-accent)]">
              Private Admin
            </p>
            <p className="mt-1 text-base font-bold text-slate-900">ABR Associates</p>
          </div>
          <button
            type="button"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-2xl border border-[var(--color-border)] bg-white/80 p-3 text-slate-700 transition hover:bg-[var(--color-surface-muted)]"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="animate-enter mt-3 rounded-3xl border border-[var(--color-border)] bg-[rgba(255,255,255,0.94)] p-3 shadow-[0_20px_60px_rgba(23,32,51,0.12)] backdrop-blur-xl">
            <nav className="space-y-2">
              {navigation.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                      active
                        ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                        : "text-slate-600 hover:bg-[var(--color-surface-muted)] hover:text-slate-900",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ) : null}
      </div>

      <aside className="surface hidden min-h-screen w-full flex-col border-r border-[var(--color-border)] p-5 xl:p-6 lg:flex">
        <div className="rounded-3xl bg-[var(--color-primary)] p-5 text-white">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-emerald-100">
            Private Admin
          </p>
          <h1 className="mt-3 text-2xl font-bold">ABR Associates</h1>
          <p className="mt-2 text-sm text-emerald-50/80">
            Manager workspace for recruitment, operations, documentation, and finance.
          </p>
        </div>

        <nav className="mt-8 space-y-2">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;

            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  active
                    ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                    : "text-slate-600 hover:bg-white/70 hover:text-slate-900",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-3xl border border-dashed border-[var(--color-border)] p-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">Manager Note</p>
          <p className="mt-2">
            Keep helper records, lead stages, documentation progress, and finance entries updated daily.
          </p>
        </div>
      </aside>
    </>
  );
}
