import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { requirePageAccess } from "@/lib/auth";
import { HelperForm } from "@/components/helpers/helper-form";
import { TopHeader } from "@/components/layout/top-header";
import { TableShell } from "@/components/table-shell";
import { Button, buttonClassName } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { FlashMessage } from "@/components/ui/flash-message";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ui/status-badge";
import { deleteHelperAction } from "@/lib/actions";
import { getHelpers } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/env";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Helpers",
};

export default async function HelpersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    edit?: string;
    type?: "success" | "error";
    message?: string;
  }>;
}) {
  await requirePageAccess("helpers");
  const params = await searchParams;
  const helpers = await getHelpers(params.q);
  const helperToEdit = helpers.find((helper) => helper.id === params.edit);
  const configured = isSupabaseConfigured();

  return (
    <div className="space-y-6">
      <FlashMessage type={params.type} message={params.message} />
      <TopHeader
        title="Helper Database"
        subtitle="Store only the core helper details needed for quick daily office updates."
        showSignOut={configured}
      />

      <div className="space-y-6">
        <TableShell
          title="Helpers"
          description="Keep helper records short, searchable, and easy to maintain."
          actions={
            <form className="flex w-full flex-col gap-3 sm:max-w-md sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  name="q"
                  placeholder="Search helper ID, name, country..."
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
                        href={`/helpers?edit=${helper.id}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`}
                        className={`${buttonClassName("secondary")} w-full sm:w-auto`}
                      >
                        Edit
                      </Link>
                      <form action={deleteHelperAction} className="w-full sm:w-auto">
                        <input type="hidden" name="id" value={helper.id} />
                        <input type="hidden" name="helper_name" value={helper.name} />
                        <input type="hidden" name="redirect_to" value="/helpers" />
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
                            href={`/helpers?edit=${helper.id}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`}
                            className={buttonClassName("secondary")}
                          >
                            Edit
                          </Link>
                          <form action={deleteHelperAction}>
                            <input type="hidden" name="id" value={helper.id} />
                            <input type="hidden" name="helper_name" value={helper.name} />
                            <input type="hidden" name="redirect_to" value="/helpers" />
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

        <div className="max-w-4xl">
          <HelperForm helper={helperToEdit} disabled={!configured} />
        </div>
      </div>
    </div>
  );
}
