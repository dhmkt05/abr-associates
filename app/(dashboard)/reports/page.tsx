import type { Metadata } from "next";
import Link from "next/link";
import { requirePageAccess } from "@/lib/auth";
import { TopHeader } from "@/components/layout/top-header";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
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
  searchParams: Promise<{ month?: string; handler?: string }>;
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
  const handlerOptions = Array.from(new Set(appData.deals.map((deal) => deal.handled_by))).sort();

  const filteredDeals = appData.deals.filter((deal) => {
    const dealMonth = new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
    }).format(new Date(deal.created_at));

    const monthMatches = params.month ? dealMonth === params.month : true;
    const handlerMatches = params.handler ? deal.handled_by === params.handler : true;

    return monthMatches && handlerMatches;
  });

  const filteredDealIds = new Set(filteredDeals.map((deal) => deal.id));
  const filteredFinance = appData.finance.filter((item) =>
    item.deal_id ? filteredDealIds.has(item.deal_id) : true,
  );
  const filteredDocs = appData.documentation.filter((item) => filteredDealIds.has(item.deal_id));

  const helperByStatus = Array.from(
    new Map(
      appData.helpers.map((helper) => [
        helper.status,
        appData.helpers.filter((item) => item.status === helper.status).length,
      ]),
    ),
  );

  return (
    <div className="space-y-6">
      <TopHeader
        title="Reports"
        subtitle="Review helper availability, sales outcomes, documentation load, and finance totals from one place."
        showSignOut={configured}
      />

      <Card>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Filter reports</h3>
            <p className="text-sm text-slate-500">
              Review one month or handler at a time, then export a CSV snapshot.
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
              <Select name="handler" defaultValue={params.handler ?? ""} className="sm:min-w-44">
                <option value="">All handlers</option>
                {handlerOptions.map((handler) => (
                  <option key={handler} value={handler}>
                    {handler}
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
              href={`/api/export?type=report${params.month ? `&month=${encodeURIComponent(params.month)}` : ""}${params.handler ? `&handler=${encodeURIComponent(params.handler)}` : ""}`}
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
              <p className="text-sm text-slate-500">Deals closed</p>
              <p className="mt-2 text-2xl font-bold">
                {filteredDeals.filter((deal) => deal.status === "deal closed").length}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--color-surface-muted)] p-4">
              <p className="text-sm text-slate-500">Documentation records</p>
              <p className="mt-2 text-2xl font-bold">{filteredDocs.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Helper status</h3>
          <div className="mt-5 space-y-4">
            {helperByStatus.map(([status, count]) => (
              <div key={status}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">{status}</span>
                  <span className="text-sm font-semibold text-slate-900">{count}</span>
                </div>
                <div className="mt-2 h-3 rounded-full bg-[var(--color-surface-muted)]">
                  <div
                    className="h-3 rounded-full bg-[linear-gradient(90deg,var(--color-accent),var(--color-primary))]"
                    style={{
                      width: `${Math.max(10, (count / Math.max(metrics.totalHelpers, 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900">Filtered sales records</h3>
          <div className="mt-5 overflow-x-auto rounded-2xl">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  {["Employer ID", "Employer Name", "Employer Number", "Handled By", "Status"].map((head) => (
                    <th key={head} className="px-3 py-3 font-medium">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="border-t border-[var(--color-border)] text-slate-700">
                    <td className="px-3 py-4 font-semibold text-slate-900">{deal.employer?.employer_id}</td>
                    <td className="px-3 py-4">{deal.employer?.employer_name}</td>
                    <td className="px-3 py-4">{deal.employer?.employer_number}</td>
                    <td className="px-3 py-4">{deal.handled_by}</td>
                    <td className="px-3 py-4">
                      <StatusBadge status={deal.status} />
                    </td>
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
                  {["Date", "User", "Action", "Entity", "Description"].map((head) => (
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
