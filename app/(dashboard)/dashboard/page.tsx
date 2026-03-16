import {
  BriefcaseBusiness,
  CircleDollarSign,
  FileCheck2,
  HandCoins,
  ReceiptText,
  Users,
} from "lucide-react";
import { ActivityList } from "@/components/dashboard/activity-list";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { TopHeader } from "@/components/layout/top-header";
import { Card } from "@/components/ui/card";
import { getAppData, getDashboardMetrics, getRecentActivity } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/env";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const configured = isSupabaseConfigured();
  const [metrics, activity, appData] = await Promise.all([
    getDashboardMetrics(),
    getRecentActivity(),
    getAppData(),
  ]);

  const stageBreakdown = [
    {
      label: "New Lead",
      count: appData.deals.filter((item) => item.sales_stage === "New Lead").length,
    },
    {
      label: "Interview",
      count: appData.deals.filter((item) => item.sales_stage === "Interview").length,
    },
    {
      label: "Negotiation",
      count: appData.deals.filter((item) => item.sales_stage === "Negotiation").length,
    },
    {
      label: "Confirmed",
      count: appData.deals.filter((item) => item.sales_stage === "Confirmed").length,
    },
  ];

  return (
    <div className="space-y-6">
      <TopHeader
        title="Business Dashboard"
        subtitle="Monitor helpers, leads, documentation progress, and finance performance from one internal control panel."
        showSignOut={configured}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SummaryCard label="Total Helpers" value={String(metrics.totalHelpers)} icon={Users} />
        <SummaryCard label="Active Leads" value={String(metrics.activeLeads)} icon={BriefcaseBusiness} />
        <SummaryCard label="Deals Confirmed" value={String(metrics.dealsConfirmed)} icon={FileCheck2} />
        <SummaryCard label="Documentation Cases" value={String(metrics.documentationCases)} icon={ReceiptText} />
        <SummaryCard label="Revenue" value={formatCurrency(metrics.revenue)} icon={CircleDollarSign} />
        <SummaryCard label="Profit" value={formatCurrency(metrics.profit)} icon={HandCoins} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <ActivityList items={activity} />
        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Sales pipeline snapshot</h3>
          <p className="text-sm text-slate-500">
            Quick look at lead progress across the recruitment workflow.
          </p>
          <div className="mt-5 space-y-4">
            {stageBreakdown.map((stage) => (
              <div key={stage.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{stage.label}</span>
                  <span className="font-semibold text-slate-900">{stage.count}</span>
                </div>
                <div className="mt-2 h-3 rounded-full bg-[var(--color-surface-muted)]">
                  <div
                    className="h-3 rounded-full bg-[linear-gradient(90deg,var(--color-primary),var(--color-accent))]"
                    style={{
                      width: `${Math.max(
                        12,
                        (stage.count / Math.max(appData.deals.length, 1)) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
