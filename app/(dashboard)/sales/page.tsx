import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { requirePageAccess } from "@/lib/auth";
import { TopHeader } from "@/components/layout/top-header";
import { DealForm } from "@/components/sales/deal-form";
import { TableShell } from "@/components/table-shell";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { FlashMessage } from "@/components/ui/flash-message";
import { Input, Select } from "@/components/ui/input";
import { RecordDetailsDialog } from "@/components/ui/record-details-dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { deleteDealAction } from "@/lib/actions";
import { getAppData, getDeals } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/env";
import { buildRedirectUrl, cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sales",
};

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    staff?: string;
    status?: string;
    edit?: string;
    view?: string;
    type?: "success" | "error";
    message?: string;
  }>;
}) {
  await requirePageAccess("sales");
  const params = await searchParams;
  const [{ deals: allDeals }, deals] = await Promise.all([
    getAppData(),
    getDeals(params.q, {
      handledBy: params.staff,
      status: params.status,
    }),
  ]);
  const dealToEdit = deals.find((deal) => deal.id === params.edit);
  const dealToView = deals.find((deal) => deal.id === params.view);
  const configured = isSupabaseConfigured();
  const baseSalesHref = buildRedirectUrl("/sales", {
    q: params.q,
    staff: params.staff,
    status: params.status,
  });
  const salesStaffOptions = Array.from(new Set(allDeals.map((deal) => deal.handled_by))).sort();
  const salesStatusOptions = [
    "prospect",
    "interview going",
    "negotiation",
    "deal closed",
    "deal cancelled",
  ] as const;
  const salesSummary = [
    { label: "Total Leads", value: deals.length, tone: "slate" },
    { label: "Prospect", value: deals.filter((deal) => deal.status === "prospect").length, tone: "slate" },
    { label: "Interview Going", value: deals.filter((deal) => deal.status === "interview going").length, tone: "amber" },
    { label: "Negotiation", value: deals.filter((deal) => deal.status === "negotiation").length, tone: "sky" },
    { label: "Deal Closed", value: deals.filter((deal) => deal.status === "deal closed").length, tone: "emerald" },
    { label: "Deal Cancelled", value: deals.filter((deal) => deal.status === "deal cancelled").length, tone: "rose" },
  ];

  return (
    <div className="space-y-6">
      {dealToView ? (
        <RecordDetailsDialog
          title={dealToView.employer?.employer_name ?? "Sales details"}
          subtitle={`Sales record ${dealToView.employer?.employer_id ?? ""}`}
          closeHref={baseSalesHref}
          fields={[
            { label: "Employer ID", value: dealToView.employer?.employer_id ?? "-" },
            { label: "Employer name", value: dealToView.employer?.employer_name ?? "-" },
            { label: "Employer number", value: dealToView.employer?.employer_number ?? "-" },
            { label: "Handled by", value: dealToView.handled_by },
            { label: "Status", value: <StatusBadge status={dealToView.status} /> },
            {
              label: "Expected date",
              value: dealToView.expected_date ? formatDate(dealToView.expected_date) : "-",
            },
            {
              label: "Notes",
              value: <div className="whitespace-pre-wrap">{dealToView.notes || "No notes"}</div>,
            },
            { label: "Created", value: formatDate(dealToView.created_at) },
          ]}
        />
      ) : null}

      <FlashMessage type={params.type} message={params.message} />
      <TopHeader
        title="Sales Pipeline"
        subtitle="Track employer leads with only the core fields needed for quick status updates."
        showSignOut={configured}
      />

      <div className="space-y-6">
        <div className="max-w-4xl">
          <DealForm
            disabled={!configured}
            deal={dealToEdit}
            redirectTo={baseSalesHref}
            cancelHref={baseSalesHref}
          />
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {salesSummary.map((item) => (
            <Card key={item.label} className={cn(
              item.tone === "amber" && "bg-amber-50/70",
              item.tone === "sky" && "bg-sky-50/70",
              item.tone === "emerald" && "bg-emerald-50/70",
              item.tone === "rose" && "bg-rose-50/70",
            )}>
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{item.value}</p>
            </Card>
          ))}
        </section>

        <Card>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Filter sales</h3>
              <p className="text-sm text-slate-500">
                Search, filter by handler, and narrow down by sales stage in one place.
              </p>
            </div>
            <form className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  name="q"
                  placeholder="Search employer, number, status, notes..."
                  defaultValue={params.q}
                  className="pl-10"
                />
              </div>
              <Select name="staff" defaultValue={params.staff ?? ""}>
                <option value="">All staff</option>
                {salesStaffOptions.map((staff) => (
                  <option key={staff} value={staff}>
                    {staff}
                  </option>
                ))}
              </Select>
              <Select name="status" defaultValue={params.status ?? ""}>
                <option value="">All statuses</option>
                {salesStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
              <div className="flex gap-3">
                <Button type="submit" variant="secondary">
                  Apply
                </Button>
                <Link href="/sales" className={buttonClassName("ghost")}>
                  Clear
                </Link>
              </div>
            </form>
          </div>
        </Card>

        <TableShell
          title="Sales entries"
          description="Update employer records fast and move them from prospect to closed deal."
        >
          {deals.length === 0 ? (
            <EmptyState
              title="No sales entries yet"
              description="Add your first employer lead to start tracking sales status and documentation readiness."
            />
          ) : (
            <>
              <div className="space-y-4 lg:hidden">
                {deals.map((deal) => (
                  <article
                    key={deal.id}
                    className="rounded-2xl border border-[var(--color-border)] bg-white/80 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                          {deal.employer?.employer_id}
                        </p>
                        <h4 className="mt-1 text-lg font-semibold text-slate-900">
                          {deal.employer?.employer_name}
                        </h4>
                        <p className="mt-1 text-sm text-slate-600">{deal.employer?.employer_number}</p>
                      </div>
                      <StatusBadge status={deal.status} />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Handled by</p>
                        <p className="mt-1 font-medium text-slate-900">{deal.handled_by}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Created</p>
                        <p className="mt-1 font-medium text-slate-900">{formatDate(deal.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Expected Date</p>
                        <p className="mt-1 font-medium text-slate-900">
                          {deal.expected_date ? formatDate(deal.expected_date) : "-"}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Notes</p>
                        <p className="mt-1 line-clamp-2 font-medium text-slate-900" title={deal.notes || "No notes"}>
                          {deal.notes || "No notes"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <Link href={`/sales?view=${deal.id}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`} className={`${buttonClassName("ghost")} w-full sm:w-auto`}>
                        View
                      </Link>
                      <Link href={`/sales?edit=${deal.id}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`} className={`${buttonClassName("secondary")} w-full sm:w-auto`}>
                        Edit
                      </Link>
                      <form action={deleteDealAction} className="w-full sm:w-auto">
                        <input type="hidden" name="id" value={deal.id} />
                        <input type="hidden" name="employer_record_id" value={deal.employer?.id ?? ""} />
                        <input type="hidden" name="employer_name" value={deal.employer?.employer_name ?? ""} />
                        <input type="hidden" name="redirect_to" value={baseSalesHref} />
                        <ConfirmSubmitButton
                          variant="danger"
                          type="submit"
                          className="w-full sm:w-auto"
                          disabled={!configured}
                          confirmMessage={`Delete the sales entry for ${deal.employer?.employer_name}?`}
                        >
                          Delete
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </article>
                ))}
              </div>

              <table className="hidden min-w-full text-left text-sm lg:table">
                <thead className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  <tr>
                    {["Employer ID", "Employer Name", "Employer Number", "Handled By", "Status", "Expected Date", "Notes", "Created", "Actions"].map((head) => (
                      <th key={head} className="px-3 py-3 font-medium">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal) => (
                    <tr key={deal.id} className="border-t border-[var(--color-border)] text-slate-700 transition hover:bg-slate-50/80">
                      <td className="px-3 py-4 font-semibold text-slate-900">{deal.employer?.employer_id}</td>
                      <td className="px-3 py-4">{deal.employer?.employer_name}</td>
                      <td className="px-3 py-4">{deal.employer?.employer_number}</td>
                      <td className="px-3 py-4">{deal.handled_by}</td>
                      <td className="px-3 py-4">
                        <StatusBadge status={deal.status} />
                      </td>
                      <td className="px-3 py-4">{deal.expected_date ? formatDate(deal.expected_date) : "-"}</td>
                      <td className="max-w-52 px-3 py-4">
                        <span className="block truncate" title={deal.notes || "No notes"}>
                          {deal.notes || "No notes"}
                        </span>
                      </td>
                      <td className="px-3 py-4">{formatDate(deal.created_at)}</td>
                      <td className="px-3 py-4">
                        <div className="flex gap-2">
                          <Link href={`/sales?view=${deal.id}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`} className={buttonClassName("ghost")}>
                            View
                          </Link>
                          <Link href={`/sales?edit=${deal.id}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`} className={buttonClassName("secondary")}>
                            Edit
                          </Link>
                          <form action={deleteDealAction}>
                            <input type="hidden" name="id" value={deal.id} />
                            <input type="hidden" name="employer_record_id" value={deal.employer?.id ?? ""} />
                            <input type="hidden" name="employer_name" value={deal.employer?.employer_name ?? ""} />
                            <input type="hidden" name="redirect_to" value={baseSalesHref} />
                            <ConfirmSubmitButton
                              variant="danger"
                              type="submit"
                              disabled={!configured}
                              confirmMessage={`Delete the sales entry for ${deal.employer?.employer_name}?`}
                            >
                              Delete
                            </ConfirmSubmitButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </TableShell>
      </div>
    </div>
  );
}
