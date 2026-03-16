import type { Metadata } from "next";
import Link from "next/link";
import { FinanceForm } from "@/components/finance/finance-form";
import { TopHeader } from "@/components/layout/top-header";
import { TableShell } from "@/components/table-shell";
import { buttonClassName } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { FlashMessage } from "@/components/ui/flash-message";
import { deleteFinanceAction } from "@/lib/actions";
import { getAppData } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/env";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Finance",
};

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{
    edit?: string;
    type?: "success" | "error";
    message?: string;
  }>;
}) {
  const params = await searchParams;
  const { deals, finance } = await getAppData();
  const recordToEdit = finance.find((record) => record.id === params.edit);
  const configured = isSupabaseConfigured();

  return (
    <div className="space-y-6">
      <FlashMessage type={params.type} message={params.message} />
      <TopHeader
        title="Finance Tracker"
        subtitle="Record collections, supplier costs, office expenses, and profit for every confirmed deal."
        showSignOut={configured}
      />

      <div className="space-y-6">
        <TableShell
          title="Finance records"
          description="Profit is stored automatically for cleaner reporting and reconciliation."
        >
          {finance.length === 0 ? (
            <EmptyState
              title="No finance records yet"
              description="Add collections and costs to unlock revenue, profit, and reporting visibility."
            />
          ) : (
          <>
          <div className="space-y-4 lg:hidden">
            {finance.map((record) => (
              <article
                key={record.id}
                className="rounded-2xl border border-[var(--color-border)] bg-white/80 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      {formatDate(record.created_at)}
                    </p>
                    <h4 className="mt-1 text-lg font-semibold text-slate-900">
                      {record.deal?.employer?.employer_name}
                    </h4>
                  </div>
                  <p className="text-sm font-semibold text-emerald-700">
                    {formatCurrency(record.profit)}
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Received</p>
                    <p className="mt-1 font-medium text-slate-900">
                      {formatCurrency(record.amount_received)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Supplier</p>
                    <p className="mt-1 font-medium text-slate-900">
                      {formatCurrency(record.supplier_payment)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Link href={`/finance?edit=${record.id}`} className={`${buttonClassName("secondary")} w-full sm:w-auto`}>
                    Edit
                  </Link>
                  <form action={deleteFinanceAction} className="w-full sm:w-auto">
                    <input type="hidden" name="id" value={record.id} />
                    <input type="hidden" name="redirect_to" value="/finance" />
                    <ConfirmSubmitButton
                      variant="danger"
                      type="submit"
                      className="w-full sm:w-auto"
                      disabled={!configured}
                      confirmMessage={`Delete the finance record for ${record.deal?.employer?.employer_name}?`}
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
                {[
                  "Date",
                  "Employer",
                  "Amount Received",
                  "Supplier Payment",
                  "Office Expense",
                  "Profit",
                  "Actions",
                ].map((head) => (
                  <th key={head} className="px-3 py-3 font-medium">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {finance.map((record) => (
                <tr key={record.id} className="border-t border-[var(--color-border)] text-slate-700 transition hover:bg-slate-50/80">
                  <td className="px-3 py-4">{formatDate(record.created_at)}</td>
                  <td className="px-3 py-4 font-semibold text-slate-900">{record.deal?.employer?.employer_name}</td>
                  <td className="px-3 py-4">{formatCurrency(record.amount_received)}</td>
                  <td className="px-3 py-4">{formatCurrency(record.supplier_payment)}</td>
                  <td className="px-3 py-4">{formatCurrency(record.office_expense)}</td>
                  <td className="px-3 py-4 font-semibold text-emerald-700">{formatCurrency(record.profit)}</td>
                  <td className="px-3 py-4">
                    <div className="flex gap-2">
                      <Link href={`/finance?edit=${record.id}`} className={buttonClassName("secondary")}>
                        Edit
                      </Link>
                      <form action={deleteFinanceAction}>
                        <input type="hidden" name="id" value={record.id} />
                        <input type="hidden" name="redirect_to" value="/finance" />
                        <ConfirmSubmitButton
                          variant="danger"
                          type="submit"
                          disabled={!configured}
                          confirmMessage={`Delete the finance record for ${record.deal?.employer?.employer_name}?`}
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
          <FinanceForm deals={deals} disabled={!configured} record={recordToEdit} />
        </div>
      </div>
    </div>
  );
}
