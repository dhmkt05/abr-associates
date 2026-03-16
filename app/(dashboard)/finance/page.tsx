import Link from "next/link";
import { FinanceForm } from "@/components/finance/finance-form";
import { TopHeader } from "@/components/layout/top-header";
import { TableShell } from "@/components/table-shell";
import { buttonClassName } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { FlashMessage } from "@/components/ui/flash-message";
import { deleteFinanceAction } from "@/lib/actions";
import { getAppData } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/env";
import { formatCurrency, formatDate } from "@/lib/utils";

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

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <TableShell
          title="Finance records"
          description="Profit is stored automatically for cleaner reporting and reconciliation."
        >
          <table className="min-w-full text-left text-sm">
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
                <tr key={record.id} className="border-t border-[var(--color-border)] text-slate-700">
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
        </TableShell>

        <FinanceForm deals={deals} disabled={!configured} record={recordToEdit} />
      </div>
    </div>
  );
}
