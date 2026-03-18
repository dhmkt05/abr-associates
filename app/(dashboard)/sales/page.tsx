import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { requirePageAccess } from "@/lib/auth";
import { TopHeader } from "@/components/layout/top-header";
import { DealForm } from "@/components/sales/deal-form";
import { TableShell } from "@/components/table-shell";
import { Button, buttonClassName } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { FlashMessage } from "@/components/ui/flash-message";
import { Input } from "@/components/ui/input";
import { RecordDetailsDialog } from "@/components/ui/record-details-dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { deleteDealAction } from "@/lib/actions";
import { getDeals } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/env";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sales",
};

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    edit?: string;
    view?: string;
    type?: "success" | "error";
    message?: string;
  }>;
}) {
  await requirePageAccess("sales");
  const params = await searchParams;
  const deals = await getDeals(params.q);
  const dealToEdit = deals.find((deal) => deal.id === params.edit);
  const dealToView = deals.find((deal) => deal.id === params.view);
  const configured = isSupabaseConfigured();
  const baseSalesHref = params.q ? `/sales?q=${encodeURIComponent(params.q)}` : "/sales";

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

        <TableShell
          title="Sales entries"
          description="Update employer records fast and move them from prospect to closed deal."
          actions={
            <form className="flex w-full flex-col gap-3 sm:max-w-md sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  name="q"
                  placeholder="Search employer, number, status, notes..."
                  defaultValue={params.q}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="secondary" className="w-full sm:w-auto">
                Search
              </Button>
            </form>
          }
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
                    {["Employer ID", "Employer Name", "Employer Number", "Handled By", "Status", "Notes", "Created", "Actions"].map((head) => (
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
