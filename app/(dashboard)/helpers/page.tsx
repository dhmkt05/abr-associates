import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { requirePageAccess } from "@/lib/auth";
import { HelperForm } from "@/components/helpers/helper-form";
import { TopHeader } from "@/components/layout/top-header";
import { TableShell } from "@/components/table-shell";
import { Button, buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { FlashMessage } from "@/components/ui/flash-message";
import { Input, Select } from "@/components/ui/input";
import { RecordDetailsDialog } from "@/components/ui/record-details-dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { deleteHelperAction } from "@/lib/actions";
import { getAppData, getHelpers } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/env";
import { buildRedirectUrl, cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Helpers",
};

export default async function HelpersPage({
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
  await requirePageAccess("helpers");
  const params = await searchParams;
  const [{ helpers: allHelpers }, helpers] = await Promise.all([
    getAppData(),
    getHelpers(params.q, {
      addedBy: params.staff,
      status: params.status,
    }),
  ]);
  const helperToEdit = helpers.find((helper) => helper.id === params.edit);
  const helperToView = helpers.find((helper) => helper.id === params.view);
  const configured = isSupabaseConfigured();
  const baseHelpersHref = buildRedirectUrl("/helpers", {
    q: params.q,
    staff: params.staff,
    status: params.status,
  });
  const helperStaffOptions = Array.from(new Set(allHelpers.map((helper) => helper.added_by))).sort();
  const helperStatusOptions = Array.from(new Set(allHelpers.map((helper) => helper.status))).sort();
  const availableCount = helpers.filter((helper) => {
    const normalized = helper.status.trim().toLowerCase();
    return normalized === "available" || normalized === "active";
  }).length;
  const placedCount = helpers.filter((helper) => helper.status.trim().toLowerCase() === "placed").length;
  const missedCount = helpers.length - availableCount - placedCount;
  const helperSummary = [
    { label: "Total Helpers", value: helpers.length, tone: "slate" },
    { label: "Active", value: availableCount, tone: "emerald" },
    { label: "Placed", value: placedCount, tone: "sky" },
    { label: "Missed", value: missedCount, tone: "amber" },
  ];

  return (
    <div className="space-y-6">
      {helperToView ? (
        <RecordDetailsDialog
          title={helperToView.name}
          subtitle={`Helper record ${helperToView.helper_id}`}
          closeHref={baseHelpersHref}
          fields={[
            { label: "Helper ID", value: helperToView.helper_id },
            { label: "Name", value: helperToView.name },
            { label: "Country", value: helperToView.country },
            { label: "Type", value: helperToView.type },
            { label: "Added by", value: helperToView.added_by },
            { label: "Status", value: <StatusBadge status={helperToView.status} /> },
            { label: "Created", value: formatDate(helperToView.created_at) },
          ]}
        />
      ) : null}

      <FlashMessage type={params.type} message={params.message} />
      <TopHeader
        title="Helper Database"
        subtitle="Store only the core helper details needed for quick daily office updates."
        showSignOut={configured}
      />

      <div className="space-y-6">
        <div className="max-w-4xl">
          <HelperForm
            helper={helperToEdit}
            disabled={!configured}
            redirectTo={params.q ? `/helpers?q=${encodeURIComponent(params.q)}` : "/helpers"}
            cancelHref={params.q ? `/helpers?q=${encodeURIComponent(params.q)}` : "/helpers"}
          />
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {helperSummary.map((item) => (
            <Card key={item.label} className={cn(
              item.tone === "emerald" && "bg-emerald-50/70",
              item.tone === "sky" && "bg-sky-50/70",
              item.tone === "amber" && "bg-amber-50/70",
            )}>
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold text-slate-950">{item.value}</p>
            </Card>
          ))}
        </section>

        <Card>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Filter helpers</h3>
              <p className="text-sm text-slate-500">
                Combine search with staff and status filters to narrow the helper list.
              </p>
            </div>
            <form className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  name="q"
                  placeholder="Search helper ID, name, country..."
                  defaultValue={params.q}
                  className="pl-10"
                />
              </div>
              <Select name="staff" defaultValue={params.staff ?? ""}>
                <option value="">All staff</option>
                {helperStaffOptions.map((staff) => (
                  <option key={staff} value={staff}>
                    {staff}
                  </option>
                ))}
              </Select>
              <Select name="status" defaultValue={params.status ?? ""}>
                <option value="">All statuses</option>
                {helperStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
              <div className="flex gap-3">
                <Button type="submit" variant="secondary">
                  Apply
                </Button>
                <Link href="/helpers" className={buttonClassName("ghost")}>
                  Clear
                </Link>
              </div>
            </form>
          </div>
        </Card>

        <TableShell
          title="Helpers"
          description="Keep helper records short, searchable, and easy to maintain."
        >
          {helpers.length === 0 ? (
            <EmptyState
              title="No helpers available"
              description="Add your first helper record to start building a clean daily working list."
            />
          ) : (
            <>
              <div className="space-y-4 lg:hidden">
                {helpers.map((helper) => (
                  <article
                    key={helper.id}
                    className="rounded-2xl border border-[var(--color-border)] bg-white/80 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                          {helper.helper_id}
                        </p>
                        <h4 className="mt-1 text-lg font-semibold text-slate-900">{helper.name}</h4>
                      </div>
                      <StatusBadge status={helper.status} />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Country</p>
                        <p className="mt-1 font-medium text-slate-900">{helper.country}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Type</p>
                        <p className="mt-1 font-medium text-slate-900">{helper.type}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Added by</p>
                        <p className="mt-1 font-medium text-slate-900">{helper.added_by}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Created</p>
                        <p className="mt-1 font-medium text-slate-900">{formatDate(helper.created_at)}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <Link
                        href={`/helpers?view=${helper.id}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`}
                        className={`${buttonClassName("ghost")} w-full sm:w-auto`}
                      >
                        View
                      </Link>
                      <Link
                        href={`/helpers?edit=${helper.id}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`}
                        className={`${buttonClassName("secondary")} w-full sm:w-auto`}
                      >
                        Edit
                      </Link>
                      <form action={deleteHelperAction} className="w-full sm:w-auto">
                        <input type="hidden" name="id" value={helper.id} />
                        <input type="hidden" name="helper_name" value={helper.name} />
                        <input type="hidden" name="redirect_to" value={baseHelpersHref} />
                        <ConfirmSubmitButton
                          variant="danger"
                          type="submit"
                          className="w-full sm:w-auto"
                          disabled={!configured}
                          confirmMessage={`Delete helper ${helper.name}? This cannot be undone.`}
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
                    {["Helper ID", "Name", "Country", "Type", "Added By", "Status", "Created", "Actions"].map((head) => (
                      <th key={head} className="px-3 py-3 font-medium">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {helpers.map((helper) => (
                    <tr key={helper.id} className="border-t border-[var(--color-border)] text-slate-700 transition hover:bg-slate-50/80">
                      <td className="px-3 py-4 font-semibold text-slate-900">{helper.helper_id}</td>
                      <td className="px-3 py-4">{helper.name}</td>
                      <td className="px-3 py-4">{helper.country}</td>
                      <td className="px-3 py-4">{helper.type}</td>
                      <td className="px-3 py-4">{helper.added_by}</td>
                      <td className="px-3 py-4">
                        <StatusBadge status={helper.status} />
                      </td>
                      <td className="px-3 py-4">{formatDate(helper.created_at)}</td>
                      <td className="px-3 py-4">
                        <div className="flex gap-2">
                          <Link
                            href={`/helpers?view=${helper.id}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`}
                            className={buttonClassName("ghost")}
                          >
                            View
                          </Link>
                          <Link
                            href={`/helpers?edit=${helper.id}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`}
                            className={buttonClassName("secondary")}
                          >
                            Edit
                          </Link>
                          <form action={deleteHelperAction}>
                            <input type="hidden" name="id" value={helper.id} />
                            <input type="hidden" name="helper_name" value={helper.name} />
                            <input type="hidden" name="redirect_to" value={baseHelpersHref} />
                            <ConfirmSubmitButton
                              variant="danger"
                              type="submit"
                              disabled={!configured}
                              confirmMessage={`Delete helper ${helper.name}? This cannot be undone.`}
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
