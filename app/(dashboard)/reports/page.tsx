import type { Metadata } from "next";
import Link from "next/link";
import { requirePageAccess } from "@/lib/auth";
import { TopHeader } from "@/components/layout/top-header";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { getActivityLogs, getAppData, getDashboardMetrics } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/env";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Reports",
};

function getMonthOptions(deals: Awaited<ReturnType<typeof getAppData>>["deals"]) {
  return Array.from(
    new Set(
      deals.map((deal) =>
        new Intl.DateTimeFormat("en-CA", {
          year: "numeric",
          month: "2-digit",
        }).format(new Date(deal.created_at)),
      ),
    ),
  ).sort();
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; staff?: string }>;
}) {
  await requirePageAccess("reports");
  const configured = isSupabaseConfigured();
  const params = await searchParams;
  const [metrics, appData, activityLogs] = await Promise.all([
    getDashboardMetrics(),
    getAppData(),
    getActivityLogs(),
  ]);
  const monthOptions = getMonthOptions(appData.deals);
  const staffOptions = Array.from(new Set(appData.deals.map((deal) => deal.sales_staff))).sort();

  const filteredDeals = appData.deals.filter((deal) => {
    const dealMonth = new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
    }).format(new Date(deal.created_at));

    const monthMatches = params.month ? dealMonth === params.month : true;
    const staffMatches = params.staff ? deal.sales_staff === params.staff : true;

    return monthMatches && staffMatches;
  });

  const filteredDealIds = new Set(filteredDeals.map((deal) => deal.id));
  const filteredFinance = appData.finance.filter((item) => filteredDealIds.has(item.deal_id));
  const filteredDocs = appData.documentation.filter((item) => filteredDealIds.has(item.deal_id));

  const helperByStatus = ["Available", "Reserved", "Placed", "Inactive"].map((status) => ({
    status,
    count: appData.helpers.filter((helper) => helper.status === status).length,
  }));

  const staffPerformance = Array.from(
    new Map(
      filteredDeals.map((deal) => [
        deal.sales_staff,
        filteredDeals.filter((item) => item.sales_staff === deal.sales_staff).length,
      ]),
    ),
  );

  return (
    <div className="space-y-6">
      <TopHeader
        title="Reports"
        subtitle="Use quick summaries to review recruitment inventory, staff performance, and financial outcomes."
        showSignOut={configured}
      />

      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Filter reports</h3>
            <p className="text-sm text-slate-500">
              Review specific months and sales staff, then export a CSV snapshot.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <form className="flex flex-col gap-3 sm:flex-row">
              <Select name="month" defaultValue={params.month ?? ""} className="sm:min-w-44">
                <option value="">All months</option>
                {monthOptions.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </Select>
              <Select name="staff" defaultValue={params.staff ?? ""} className="sm:min-w-44">
                <option value="">All staff</option>
                {staffOptions.map((staff) => (
                  <option key={staff} value={staff}>
                    {staff}
                  </option>
                ))}
              </Select>
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white"
              >
                Apply filters
              </button>
            </form>
            <Link
              href={`/api/export?type=report${params.month ? `&month=${encodeURIComponent(params.month)}` : ""}${params.staff ? `&staff=${encodeURIComponent(params.staff)}` : ""}`}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-slate-900"
            >
              Export CSV
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Monthly overview</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[var(--color-surface-muted)] p-4">
              <p className="text-sm text-slate-500">Revenue</p>
              <p className="mt-2 text-2xl font-bold">
                {formatCurrency(filteredFinance.reduce((sum, item) => sum + item.amount_received, 0))}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--color-surface-muted)] p-4">
              <p className="text-sm text-slate-500">Profit</p>
              <p className="mt-2 text-2xl font-bold">
                {formatCurrency(filteredFinance.reduce((sum, item) => sum + item.profit, 0))}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--color-surface-muted)] p-4">
              <p className="text-sm text-slate-500">Confirmed deals</p>
              <p className="mt-2 text-2xl font-bold">
                {filteredDeals.filter((deal) => deal.sales_stage === "Confirmed").length}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--color-surface-muted)] p-4">
              <p className="text-sm text-slate-500">Documentation cases</p>
              <p className="mt-2 text-2xl font-bold">{filteredDocs.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Helper availability</h3>
          <div className="mt-5 space-y-4">
            {helperByStatus.map((item) => (
              <div key={item.status}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{item.status}</span>
                  <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                </div>
                <div className="mt-2 h-3 rounded-full bg-[var(--color-surface-muted)]">
                  <div
                    className="h-3 rounded-full bg-[linear-gradient(90deg,var(--color-accent),var(--color-primary))]"
                    style={{
                      width: `${Math.max(
                        10,
                        (item.count / Math.max(metrics.totalHelpers, 1)) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900">Sales staff activity</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {staffPerformance.map(([staff, count]) => (
              <div key={staff} className="rounded-2xl border border-[var(--color-border)] bg-white/70 p-4">
                <p className="text-sm text-slate-500">{staff}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{count}</p>
                <p className="mt-1 text-sm text-slate-600">Active lead records</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900">Filtered pipeline records</h3>
          <div className="mt-5 overflow-x-auto rounded-2xl">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  {["Employer", "Helper", "Staff", "Stage", "Expected Amount"].map((head) => (
                    <th key={head} className="px-3 py-3 font-medium">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="border-t border-[var(--color-border)] text-slate-700">
                    <td className="px-3 py-4 font-semibold text-slate-900">{deal.employer?.employer_name}</td>
                    <td className="px-3 py-4">{deal.helper?.name}</td>
                    <td className="px-3 py-4">{deal.sales_staff}</td>
                    <td className="px-3 py-4">{deal.sales_stage}</td>
                    <td className="px-3 py-4">{formatCurrency(deal.expected_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900">Activity log</h3>
          <div className="mt-5 overflow-x-auto rounded-2xl">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  {["Date", "User", "Role", "Action", "Entity", "Description"].map((head) => (
                    <th key={head} className="px-3 py-3 font-medium">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activityLogs.map((log) => (
                  <tr key={log.id} className="border-t border-[var(--color-border)] text-slate-700">
                    <td className="px-3 py-4">{new Date(log.created_at).toLocaleString("en-SG")}</td>
                    <td className="px-3 py-4">{log.user_email}</td>
                    <td className="px-3 py-4">{log.role}</td>
                    <td className="px-3 py-4">{log.action}</td>
                    <td className="px-3 py-4">{log.entity_type}</td>
                    <td className="px-3 py-4">{log.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
