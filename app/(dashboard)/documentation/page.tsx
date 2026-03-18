import type { Metadata } from "next";
import Link from "next/link";
import { requirePageAccess } from "@/lib/auth";
import { DocumentationForm } from "@/components/documentation/documentation-form";
import { TopHeader } from "@/components/layout/top-header";
import { TableShell } from "@/components/table-shell";
import { buttonClassName } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { FlashMessage } from "@/components/ui/flash-message";
import { StatusBadge } from "@/components/ui/status-badge";
import { deleteDocumentationAction } from "@/lib/actions";
import { getAppData } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/env";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Documentation",
};

export default async function DocumentationPage({
  searchParams,
}: {
  searchParams: Promise<{
    edit?: string;
    type?: "success" | "error";
    message?: string;
  }>;
}) {
  await requirePageAccess("documentation");
  const params = await searchParams;
  const { deals, documentation } = await getAppData();
  const recordToEdit = documentation.find((record) => record.id === params.edit);
  const configured = isSupabaseConfigured();

  return (
    <div className="space-y-6">
      <FlashMessage type={params.type} message={params.message} />
      <TopHeader
        title="Documentation Tracker"
        subtitle="Use closed sales records and update only the current process and upfront payment status."
        showSignOut={configured}
      />

      <div className="space-y-6">
        <div className="max-w-4xl">
          <DocumentationForm deals={deals} disabled={!configured} record={recordToEdit} />
        </div>

        <TableShell
          title="Documentation records"
          description="Closed sales entries can move here for simple post-deal process tracking."
        >
          {documentation.length === 0 ? (
            <EmptyState
              title="No documentation records"
              description="Mark a sales entry as deal closed to start documentation tracking."
            />
          ) : (
            <>
              <div className="space-y-4 lg:hidden">
                {documentation.map((record) => (
                  <article
                    key={record.id}
                    className="rounded-2xl border border-[var(--color-border)] bg-white/80 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                          {record.deal?.employer?.employer_id}
                        </p>
                        <h4 className="mt-1 text-lg font-semibold text-slate-900">
                          {record.deal?.employer?.employer_name}
                        </h4>
                        <p className="mt-1 text-sm text-slate-600">{record.deal?.employer?.employer_number}</p>
                      </div>
                      <StatusBadge status={record.upfront_payment_status} />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Current process</p>
                        <p className="mt-1 font-medium text-slate-900">{record.current_process}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Created</p>
                        <p className="mt-1 font-medium text-slate-900">{formatDate(record.created_at)}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <Link
                        href={`/documentation?edit=${record.id}`}
                        className={`${buttonClassName("secondary")} w-full sm:w-auto`}
                      >
                        Edit
                      </Link>
                      <form action={deleteDocumentationAction} className="w-full sm:w-auto">
                        <input type="hidden" name="id" value={record.id} />
                        <input type="hidden" name="redirect_to" value="/documentation" />
                        <ConfirmSubmitButton
                          variant="danger"
                          type="submit"
                          className="w-full sm:w-auto"
                          disabled={!configured}
                          confirmMessage={`Delete the documentation record for ${record.deal?.employer?.employer_name}?`}
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
                    {["Employer ID", "Employer Name", "Employer Number", "Current Process", "Upfront Payment", "Created", "Actions"].map((head) => (
                      <th key={head} className="px-3 py-3 font-medium">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {documentation.map((record) => (
                    <tr key={record.id} className="border-t border-[var(--color-border)] text-slate-700 transition hover:bg-slate-50/80">
                      <td className="px-3 py-4 font-semibold text-slate-900">{record.deal?.employer?.employer_id}</td>
                      <td className="px-3 py-4">{record.deal?.employer?.employer_name}</td>
                      <td className="px-3 py-4">{record.deal?.employer?.employer_number}</td>
                      <td className="px-3 py-4">{record.current_process}</td>
                      <td className="px-3 py-4">
                        <StatusBadge status={record.upfront_payment_status} />
                      </td>
                      <td className="px-3 py-4">{formatDate(record.created_at)}</td>
                      <td className="px-3 py-4">
                        <div className="flex gap-2">
                          <Link href={`/documentation?edit=${record.id}`} className={buttonClassName("secondary")}>
                            Edit
                          </Link>
                          <form action={deleteDocumentationAction}>
                            <input type="hidden" name="id" value={record.id} />
                            <input type="hidden" name="redirect_to" value="/documentation" />
                            <ConfirmSubmitButton
                              variant="danger"
                              type="submit"
                              disabled={!configured}
                              confirmMessage={`Delete the documentation record for ${record.deal?.employer?.employer_name}?`}
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
