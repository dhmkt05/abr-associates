import type { Metadata } from "next";
import { requirePageAccess } from "@/lib/auth";
import {
  BriefcaseBusiness,
  CircleDollarSign,
  FileCheck2,
  HandCoins,
  TrendingUp,
  ReceiptText,
  Users,
} from "lucide-react";
import { ActivityList } from "@/components/dashboard/activity-list";
import {
  DealsStageChart,
  HelpersTrendChart,
  RevenueChart,
} from "@/components/dashboard/charts";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { TopHeader } from "@/components/layout/top-header";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getAppData, getDashboardMetrics, getRecentActivity } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/env";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
};

function buildMonthlySeries<T extends { created_at: string }>(
  items: T[],
  getValue: (item: T) => number,
) {
  const monthMap = new Map<string, number>();

  items.forEach((item) => {
    const month = new Intl.DateTimeFormat("en-US", {
      month: "short",
    }).format(new Date(item.created_at));

    monthMap.set(month, (monthMap.get(month) ?? 0) + getValue(item));
  });

  return Array.from(monthMap.entries()).map(([month, value]) => ({
    month,
    value,
  }));
}

export default async function DashboardPage() {
  await requirePageAccess("dashboard");
  const configured = isSupabaseConfigured();
  const [metrics, activity, appData] = await Promise.all([
    getDashboardMetrics(),
    getRecentActivity(),
    getAppData(),
  ]);

  const stageBreakdown = ["prospect", "interview going", "negotiation", "deal closed"].map((label) => ({
    name: label,
    value: appData.deals.filter((item) => item.status === label).length,
  }));

  const revenueData = buildMonthlySeries(appData.finance, (item) => item.amount_received).map(
    ({ month, value }) => ({
      month,
      revenue: value,
    }),
  );

  const helpersData = buildMonthlySeries(appData.helpers, () => 1).map(({ month, value }) => ({
    month,
    helpers: value,
  }));

  return (
    <div className="space-y-6">
      <TopHeader
        title="Business Dashboard"
        subtitle="Monitor helpers, sales, documentation progress, and finance performance from one simple admin workspace."
        showSignOut={configured}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SummaryCard label="Total Helpers" value={String(metrics.totalHelpers)} icon={Users} trend="Inventory updated" />
        <SummaryCard label="Active Leads" value={String(metrics.activeLeads)} icon={BriefcaseBusiness} trend="Pipeline in motion" />
        <SummaryCard label="Deals Closed" value={String(metrics.dealsConfirmed)} icon={FileCheck2} trend="Ready for documentation" />
        <SummaryCard label="Documentation Cases" value={String(metrics.documentationCases)} icon={ReceiptText} trend="Cases under processing" />
        <SummaryCard label="Revenue" value={formatCurrency(metrics.revenue)} icon={CircleDollarSign} trend="Collections tracked" />
        <SummaryCard label="Profit" value={formatCurrency(metrics.profit)} icon={HandCoins} trend="Finance visibility improved" />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <RevenueChart data={revenueData.length > 0 ? revenueData : [{ month: "No data", revenue: 0 }]} />
        <DealsStageChart data={stageBreakdown.some((item) => item.value > 0) ? stageBreakdown : [{ name: "No data", value: 1 }]} />
        <HelpersTrendChart data={helpersData.length > 0 ? helpersData : [{ month: "No data", helpers: 0 }]} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <ActivityList items={activity} />
        <Card>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-950">Pipeline snapshot</h3>
              <p className="mt-1 text-sm text-slate-500">
                Summary of your recruitment funnel and where manager attention is needed.
              </p>
            </div>
          </div>

          {appData.deals.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="No deals available yet"
                description="Add your first sales entry to populate charts, reports, and pipeline widgets."
              />
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {stageBreakdown.map((stage) => (
                <div key={stage.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{stage.name}</span>
                    <span className="font-semibold text-slate-950">{stage.value}</span>
                  </div>
                  <div className="mt-2 h-2.5 rounded-full bg-slate-100">
                    <div
                      className="h-2.5 rounded-full bg-slate-900"
                      style={{
                        width: `${Math.max(
                          8,
                          (stage.value / Math.max(appData.deals.length, 1)) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
