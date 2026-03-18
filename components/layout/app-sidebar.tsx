"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  canRoleAccessPage,
  type ProtectedPage,
} from "@/lib/access-control";
import type { AppRole } from "@/lib/types";
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
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, page: "dashboard" as ProtectedPage }],
  },
  {
    label: "Operations",
    items: [
      { href: "/helpers", label: "Helpers", icon: Users, page: "helpers" as ProtectedPage },
      { href: "/sales", label: "Sales", icon: BriefcaseBusiness, page: "sales" as ProtectedPage },
      { href: "/documentation", label: "Documentation", icon: FileText, page: "documentation" as ProtectedPage },
      { href: "/finance", label: "Finance", icon: CircleDollarSign, page: "finance" as ProtectedPage },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/reports", label: "Reports", icon: BarChart3, page: "reports" as ProtectedPage },
      { href: "/settings", label: "Settings", icon: Settings, page: "settings" as ProtectedPage },
    ],
  },
];

export function AppSidebar({ role }: { role?: AppRole }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const filteredNavigation = role
    ? navigationGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => canRoleAccessPage(role, item.page)),
        }))
        .filter((group) => group.items.length > 0)
    : navigationGroups;

  const sidebarContent = (
    <div
      className={cn(
        "surface flex h-full flex-col border-r border-[var(--color-border)] bg-white/90 p-4 shadow-[var(--shadow-soft)]",
        collapsed ? "xl:w-[92px]" : "xl:w-[280px]",
      )}
    >
      <div className="flex items-center justify-between rounded-3xl border border-sky-200/60 bg-[linear-gradient(135deg,#21577d,#3b82a6)] px-4 py-4 text-white">
        <div className={cn("min-w-0", collapsed && "xl:hidden")}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-sky-100">
            Private Admin
          </p>
          <h1 className="mt-1 truncate text-lg font-semibold">ABR Associates</h1>
          <p className="mt-1 text-xs text-sky-50/80">Domestic helper business command center</p>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="hidden rounded-xl border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20 xl:block"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-6 space-y-6">
        {filteredNavigation.map((group) => (
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
                        ? "bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-sm ring-1 ring-sky-600/70"
                        : "text-slate-600 hover:bg-sky-50 hover:text-sky-900",
                      collapsed && "xl:justify-center",
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", active && "text-white")} />
                    <span className={cn(active && "text-white", collapsed && "xl:hidden")}>
                      {label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className={cn("mt-auto rounded-3xl border border-[var(--color-border)] bg-slate-50/90 p-4", collapsed && "xl:hidden")}>
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-[var(--color-border)]">
            <ShieldCheck className="h-4 w-4 text-sky-700" />
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-600">
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
