"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  FileText,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationGroups = [
  {
    label: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Operations",
    items: [
      { href: "/helpers", label: "Helpers", icon: Users },
      { href: "/sales", label: "Sales", icon: BriefcaseBusiness },
      { href: "/documentation", label: "Documentation", icon: FileText },
      { href: "/finance", label: "Finance", icon: CircleDollarSign },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/reports", label: "Reports", icon: BarChart3 },
      { href: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const sidebarContent = (
    <div
      className={cn(
        "surface flex h-full flex-col border-r border-[var(--color-border)] bg-white/90 p-4 shadow-[var(--shadow-soft)]",
        collapsed ? "xl:w-[92px]" : "xl:w-[280px]",
      )}
    >
      <div className="flex items-center justify-between rounded-3xl border border-[var(--color-border)] bg-slate-950 px-4 py-4 text-white">
        <div className={cn("min-w-0", collapsed && "xl:hidden")}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-blue-200">
            Private Admin
          </p>
          <h1 className="mt-1 truncate text-lg font-semibold">ABR Associates</h1>
          <p className="mt-1 text-xs text-slate-300">Domestic helper business command center</p>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="hidden rounded-xl border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/20 xl:block"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-6 space-y-6">
        {navigationGroups.map((group) => (
          <div key={group.label}>
            <p className={cn("px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400", collapsed && "xl:hidden")}>
              {group.label}
            </p>
            <nav className="mt-3 space-y-1.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition",
                      active
                        ? "bg-slate-950 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                      collapsed && "xl:justify-center",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className={cn(collapsed && "xl:hidden")}>{label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className={cn("mt-auto rounded-3xl border border-[var(--color-border)] bg-slate-50 p-4", collapsed && "xl:hidden")}>
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-[var(--color-border)]">
            <ShieldCheck className="h-4 w-4 text-slate-700" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">Secure admin workspace</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Internal access only. Keep helper, sales, documentation, and finance records updated daily.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white/90 px-4 py-3 backdrop-blur xl:hidden">
        <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-white px-4 py-3 shadow-sm">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
              Private Admin
            </p>
            <p className="mt-1 text-base font-semibold text-slate-950">ABR Associates</p>
          </div>
          <button
            type="button"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMobileOpen((value) => !value)}
            className="rounded-xl border border-[var(--color-border)] bg-slate-50 p-2.5 text-slate-700"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/35 xl:hidden" onClick={() => setMobileOpen(false)}>
          <div
            className="absolute inset-y-0 left-0 w-[88%] max-w-[320px]"
            onClick={(event) => event.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      ) : null}

      <aside className="hidden xl:block">{sidebarContent}</aside>
    </>
  );
}
