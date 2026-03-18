import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { requirePageAccess } from "@/lib/auth";
import { DocumentationForm } from "@/components/documentation/documentation-form";
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
import { deleteDocumentationAction } from "@/lib/actions";
import { getAppData, getDocumentationRecords } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/env";
import { buildRedirectUrl, cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Documentation",
};

export default async function DocumentationPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    staff?: string;
    process?: string;
    payment?: string;
    edit?: string;
    view?: string;
    type?: "success" | "error";
    message?: string;
  }>;
}) {
  await requirePageAccess("documentation");
  const params = await searchParams;
  const [{ deals, documentation: allDocumentation }, documentation] = await Promise.all([
    getAppData(),
    getDocumentationRecords(params.q, {
      assignedStaff: params.staff,
      currentProcess: params.process,
      upfrontPaymentStatus: params.payment,
    }),
  ]);
  const recordToEdit = documentation.find((record) => record.id === params.edit);
  const recordToView = documentation.find((record) => record.id === params.view);
  const configured = isSupabaseConfigured();
  const baseDocumentationHref = buildRedirectUrl("/documentation", {
    q: params.q,
    staff: params.staff,
    process: params.process,
    payment: params.payment,
  });
  const activeDocumentation = documentation.filter((record) => record.workflow_state === "active");
  const historyDocumentation = documentation.filter((record) => record.workflow_state !== "active");
  const assignedStaffOptions = Array.from(
    new Set(allDocumentation.map((record) => record.assigned_staff).filter(Boolean)),
  ).sort();
  const processOptions = Array.from(new Set(allDocumentation.map((record) => record.current_process))).sort();
  const paymentOptions = Array.from(new Set(allDocumentation.map((record) => record.upfront_payment_status))).sort();
  const inProgressCount = documentation.filter((record) =>
    ["applying IPA", "work permit", "going to take flight", "flight ticket", "insurance"].includes(
      record.current_process,
    ),
  ).length;
  const completedCount = documentation.filter((record) =>
    ["reach employer house", "medical follow up"].includes(record.current_process),
  ).length;
  const cancelledCount = documentation.filter((record) => record.workflow_state === "cancelled").length;
  const documentationSummary = [
    { label: "Total Cases", value: documentation.length, tone: "slate" },
    { label: "Active", value: activeDocumentation.length, tone: "emerald" },
    { label: "In Progress", value: inProgressCount, tone: "sky" },
    { label: "Completed", value: completedCount, tone: "indigo" },
    { label: "Cancelled", value: cancelledCount, tone: "rose" },
  ];

  return (
    <div className="space-y-6">
      {recordToView ? (
        <RecordDetailsDialog
          title={recordToView.deal?.employer?.employer_name ?? "Documentation details"}
          subtitle={`Documentation record ${recordToView.deal?.employer?.employer_id ?? ""}`}
          closeHref={baseDocumentationHref}
          fields={[
            { label: "Employer ID", value: recordToView.deal?.employer?.employer_id ?? "-" },
            { label: "Employer name", value: recordToView.deal?.employer?.employer_name ?? "-" },
            { label: "Employer number", value: recordToView.deal?.employer?.employer_number ?? "-" },
            { label: "Current process", value: recordToView.current_process },
            {
              label: "Upfront payment status",
              value: <StatusBadge status={recordToView.upfront_payment_status} />,
            },
            { label: "Workflow state", value: <StatusBadge status={recordToView.workflow_state} /> },
            { label: "Linked sales status", value: <StatusBadge status={recordToView.deal?.status ?? "prospect"} /> },
            { label: "Created", value: formatDate(recordToView.created_at) },
          ]}
        />
      ) : null}

      <FlashMessage type={params.type} message={params.message} />
      <TopHeader
        title="Documentation Tracker"
        subtitle="Use closed sales records and update only the current process and upfront payment status."
        showSignOut={configured}
      />

      <div className="space-y-6">
        <div className="max-w-4xl">
          <DocumentationForm
            deals={deals}
            disabled={!configured}
            record={recordToEdit}
            redirectTo={baseDocumentationHref}
            cancelHref={baseDocumentationHref}
          />
        </div>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {documentationSummary.map((item) => (
            <Card key={item.label} className={cn(
              item.tone === "emerald" && "bg-emerald-50/70",
              item.tone === "sky" && "bg-sky-50/70",
              item.tone === "indigo" && "bg-indigo-50/70",
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
              <h3 className="text-lg font-semibold text-slate-900">Filter documentation</h3>
              <p className="text-sm text-slate-500">
                Combine search with staff, process, and payment filters to focus the workflow.
              </p>
            </div>
            <form className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  name="q"
                  placeholder="Search employer, process, payment..."
                  defaultValue={params.q}
                  className="pl-10"
                />
              </div>
              <Select name="staff" defaultValue={params.staff ?? ""}>
                <option value="">All staff</option>
                {assignedStaffOptions.map((staff) => (
                  <option key={staff} value={staff}>
                    {staff}
                  </option>
                ))}
              </Select>
              <Select name="process" defaultValue={params.process ?? ""}>
                <option value="">All processes</option>
                {processOptions.map((process) => (
                  <option key={process} value={process}>
                    {process}
                  </option>
                ))}
              </Select>
              <Select name="payment" defaultValue={params.payment ?? ""}>
                <option value="">All payments</option>
                {paymentOptions.map((payment) => (
                  <option key={payment} value={payment}>
                    {payment}
                  </option>
                ))}
              </Select>
              <div className="flex gap-3">
                <Button type="submit" variant="secondary">
                  Apply
                </Button>
                <Link href="/documentation" className={buttonClassName("ghost")}>
                  Clear
                </Link>
              </div>
            </form>
          </div>
        </Card>

        <TableShell
          title="Documentation records"
          description="Closed sales entries stay active here. Records from deals that move away from closed remain preserved in history."
        >
          {documentation.length === 0 ? (
            <EmptyState
              title="No documentation records"
              description="Mark a sales entry as deal closed to start documentation tracking."
            />
          ) : (
            <>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900">
                <span className="font-semibold">{activeDocumentation.length}</span> active workflow record(s)
                and <span className="font-semibold">{historyDocumentation.length}</span> historical record(s).
              </div>

              <div className="space-y-6 lg:hidden">
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Active workflow
                    </h4>
                    <StatusBadge status="active" />
                  </div>
                  {activeDocumentation.length === 0 ? (
                    <EmptyState
                      title="No active documentation workflow"
                      description="Records stay here only while their linked sales entry remains deal closed."
                    />
                  ) : activeDocumentation.map((record) => (
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
                      <div className="space-y-2 text-right">
                        <StatusBadge status={record.upfront_payment_status} />
                        <StatusBadge status={record.workflow_state} />
                      </div>
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
                      <div className="col-span-2">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Linked sales status</p>
                        <div className="mt-1">
                          <StatusBadge status={record.deal?.status ?? "prospect"} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <Link
                        href={`/documentation?view=${record.id}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`}
                        className={`${buttonClassName("ghost")} w-full sm:w-auto`}
                      >
                        View
                      </Link>
                      <Link
                        href={`/documentation?edit=${record.id}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`}
                        className={`${buttonClassName("secondary")} w-full sm:w-auto`}
                      >
                        Edit
                      </Link>
                      <form action={deleteDocumentationAction} className="w-full sm:w-auto">
                        <input type="hidden" name="id" value={record.id} />
                        <input type="hidden" name="redirect_to" value={baseDocumentationHref} />
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
                </section>

                {historyDocumentation.length > 0 ? (
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                        History
                      </h4>
                      <span className="text-xs text-slate-500">
                        Preserved when sales moves away from deal closed
                      </span>
                    </div>
                    {historyDocumentation.map((record) => (
                      <article
                        key={record.id}
                        className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4"
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
                          <div className="space-y-2 text-right">
                            <StatusBadge status={record.upfront_payment_status} />
                            <StatusBadge status={record.workflow_state} />
                          </div>
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
                          <div className="col-span-2">
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Linked sales status</p>
                            <div className="mt-1">
                              <StatusBadge status={record.deal?.status ?? "prospect"} />
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                          <Link
                            href={`/documentation?view=${record.id}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`}
                            className={`${buttonClassName("ghost")} w-full sm:w-auto`}
                          >
                            View
                          </Link>
                          <Link
                            href={`/documentation?edit=${record.id}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`}
                            className={`${buttonClassName("secondary")} w-full sm:w-auto`}
                          >
                            Edit
                          </Link>
                          <form action={deleteDocumentationAction} className="w-full sm:w-auto">
                            <input type="hidden" name="id" value={record.id} />
                            <input type="hidden" name="redirect_to" value={baseDocumentationHref} />
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
                  </section>
                ) : null}
              </div>

              <div className="hidden space-y-6 lg:block">
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Active workflow
                    </h4>
                    <StatusBadge status="active" />
                  </div>
                  {activeDocumentation.length === 0 ? (
                    <EmptyState
                      title="No active documentation workflow"
                      description="Records stay here only while their linked sales entry remains deal closed."
                    />
                  ) : (
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  <tr>
                    {["Employer ID", "Employer Name", "Employer Number", "Current Process", "Upfront Payment", "Workflow", "Created", "Actions"].map((head) => (
                      <th key={head} className="px-3 py-3 font-medium">
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeDocumentation.map((record) => (
                    <tr key={record.id} className="border-t border-[var(--color-border)] text-slate-700 transition hover:bg-slate-50/80">
                      <td className="px-3 py-4 font-semibold text-slate-900">{record.deal?.employer?.employer_id}</td>
                      <td className="px-3 py-4">{record.deal?.employer?.employer_name}</td>
                      <td className="px-3 py-4">{record.deal?.employer?.employer_number}</td>
                      <td className="px-3 py-4">{record.current_process}</td>
                      <td className="px-3 py-4">
                        <StatusBadge status={record.upfront_payment_status} />
                      </td>
                      <td className="px-3 py-4">
                        <StatusBadge status={record.workflow_state} />
                      </td>
                      <td className="px-3 py-4">{formatDate(record.created_at)}</td>
                      <td className="px-3 py-4">
                        <div className="flex gap-2">
                          <Link href={`/documentation?view=${record.id}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`} className={buttonClassName("ghost")}>
                            View
                          </Link>
                          <Link href={`/documentation?edit=${record.id}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`} className={buttonClassName("secondary")}>
                            Edit
                          </Link>
                          <form action={deleteDocumentationAction}>
                            <input type="hidden" name="id" value={record.id} />
                            <input type="hidden" name="redirect_to" value={baseDocumentationHref} />
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
                  )}
                </section>

                {historyDocumentation.length > 0 ? (
                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                        History
                      </h4>
                      <span className="text-xs text-slate-500">
                        Preserved when sales moves away from deal closed
                      </span>
                    </div>
                    <table className="min-w-full text-left text-sm">
                      <thead className="text-xs uppercase tracking-[0.18em] text-slate-400">
                        <tr>
                          {["Employer ID", "Employer Name", "Employer Number", "Current Process", "Upfront Payment", "Workflow", "Created", "Actions"].map((head) => (
                            <th key={head} className="px-3 py-3 font-medium">
                              {head}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {historyDocumentation.map((record) => (
                          <tr key={record.id} className="border-t border-[var(--color-border)] bg-amber-50/40 text-slate-700 transition hover:bg-amber-50/70">
                            <td className="px-3 py-4 font-semibold text-slate-900">{record.deal?.employer?.employer_id}</td>
                            <td className="px-3 py-4">{record.deal?.employer?.employer_name}</td>
                            <td className="px-3 py-4">{record.deal?.employer?.employer_number}</td>
                            <td className="px-3 py-4">{record.current_process}</td>
                            <td className="px-3 py-4">
                              <StatusBadge status={record.upfront_payment_status} />
                            </td>
                            <td className="px-3 py-4">
                              <StatusBadge status={record.workflow_state} />
                            </td>
                            <td className="px-3 py-4">{formatDate(record.created_at)}</td>
                            <td className="px-3 py-4">
                              <div className="flex gap-2">
                                <Link href={`/documentation?view=${record.id}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`} className={buttonClassName("ghost")}>
                                  View
                                </Link>
                                <Link href={`/documentation?edit=${record.id}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`} className={buttonClassName("secondary")}>
                                  Edit
                                </Link>
                                <form action={deleteDocumentationAction}>
                                  <input type="hidden" name="id" value={record.id} />
                                  <input type="hidden" name="redirect_to" value={baseDocumentationHref} />
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
                  </section>
                ) : null}
              </div>
            </>
          )}
        </TableShell>
      </div>
    </div>
  );
}
