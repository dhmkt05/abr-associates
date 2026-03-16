import type { Metadata } from "next";
import Link from "next/link";
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
  const params = await searchParams;
  const { deals, documentation } = await getAppData();
  const recordToEdit = documentation.find((record) => record.id === params.edit);
  const configured = isSupabaseConfigured();

  return (
    <div className="space-y-6">
      <FlashMessage type={params.type} message={params.message} />
      <TopHeader
        title="Documentation Tracker"
        subtitle="Follow each confirmed case from contract to arrival and first month payment."
        showSignOut={configured}
      />

      <div className="space-y-6">
        <TableShell
          title="Documentation cases"
          description="Monitor immigration, permit, and post-arrival milestones."
        >
          {documentation.length === 0 ? (
            <EmptyState
              title="No documentation cases"
              description="Once a deal is confirmed, add documentation stages here to track permit, visa, travel, and arrival."
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
                      {record.deal?.helper?.name}
                    </p>
                    <h4 className="mt-1 text-lg font-semibold text-slate-900">
                      {record.deal?.employer?.employer_name}
                    </h4>
                  </div>
                  <StatusBadge status={record.stage} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Assigned</p>
                    <p className="mt-1 font-medium text-slate-900">{record.assigned_staff}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Status</p>
                    <p className="mt-1 font-medium text-slate-900">{record.status}</p>
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
                      confirmMessage={`Delete the ${record.stage} documentation case?`}
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
                {["Employer", "Helper", "Stage", "Assigned Staff", "Status", "Created", "Actions"].map((head) => (
                  <th key={head} className="px-3 py-3 font-medium">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documentation.map((record) => (
                <tr key={record.id} className="border-t border-[var(--color-border)] text-slate-700 transition hover:bg-slate-50/80">
                  <td className="px-3 py-4 font-semibold text-slate-900">{record.deal?.employer?.employer_name}</td>
                  <td className="px-3 py-4">{record.deal?.helper?.name}</td>
                  <td className="px-3 py-4">
                    <StatusBadge status={record.stage} />
                  </td>
                  <td className="px-3 py-4">{record.assigned_staff}</td>
                  <td className="px-3 py-4">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-3 py-4">{formatDate(record.created_at)}</td>
                  <td className="px-3 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/documentation?edit=${record.id}`}
                        className={buttonClassName("secondary")}
                      >
                        Edit
                      </Link>
                      <form action={deleteDocumentationAction}>
                        <input type="hidden" name="id" value={record.id} />
                        <input type="hidden" name="redirect_to" value="/documentation" />
                        <ConfirmSubmitButton
                          variant="danger"
                          type="submit"
                          disabled={!configured}
                          confirmMessage={`Delete the ${record.stage} documentation case?`}
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
          <DocumentationForm deals={deals} disabled={!configured} record={recordToEdit} />
        </div>
      </div>
    </div>
  );
}
