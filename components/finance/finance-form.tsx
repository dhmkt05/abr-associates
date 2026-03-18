import Link from "next/link";
import type { FinanceRow, SalesRow } from "@/lib/types";
import { createFinanceAction, updateFinanceAction } from "@/lib/actions";
import { FormSection } from "@/components/ui/form-section";
import { buttonClassName } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

export function FinanceForm({
  deals,
  disabled,
  record,
}: {
  deals: SalesRow[];
  disabled: boolean;
  record?: FinanceRow;
}) {
  const action = record ? updateFinanceAction : createFinanceAction;
  const currentDeal =
    record?.deal_id ? deals.find((deal) => deal.id === record.deal_id) : undefined;
  const closedDeals = deals.filter((deal) => deal.status === "deal closed");
  const selectableDeals = currentDeal
    ? [currentDeal, ...closedDeals.filter((deal) => deal.id !== currentDeal.id)]
    : closedDeals;

  return (
    <FormSection
      title={record ? "Edit finance record" : "Add finance record"}
      description="Use a deal link when available, or type a direct reference for quick finance updates."
    >
      <form action={action} className="mt-5 space-y-4">
        <input type="hidden" name="redirect_to" value="/finance" />
        {record ? <input type="hidden" name="id" value={record.id} /> : null}
        {record ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Editing existing finance entry</p>
              <p className="text-amber-800">
                Saving will update this finance record and keep the values you entered.
              </p>
            </div>
            <Link href="/finance" className={buttonClassName("secondary")}>
              Cancel edit
            </Link>
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Closed deal link</span>
            <Select name="deal_id" disabled={disabled} defaultValue={record?.deal_id ?? ""}>
              <option value="">No linked deal</option>
              {selectableDeals.map((deal) => (
                <option key={deal.id} value={deal.id}>
                  {deal.employer?.employer_id} · {deal.employer?.employer_name}
                </option>
              ))}
            </Select>
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Employer / reference</span>
            <Input
              name="reference"
              required
              disabled={disabled}
              defaultValue={record?.reference ?? record?.deal?.employer?.employer_name}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Amount received</span>
            <Input
              name="amount_received"
              type="number"
              step="0.01"
              required
              disabled={disabled}
              defaultValue={record?.amount_received}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Supplier payment</span>
            <Input
              name="supplier_payment"
              type="number"
              step="0.01"
              required
              disabled={disabled}
              defaultValue={record?.supplier_payment}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Office expense</span>
            <Input
              name="office_expense"
              type="number"
              step="0.01"
              required
              disabled={disabled}
              defaultValue={record?.office_expense}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Salary</span>
            <Input
              name="salary"
              type="number"
              step="0.01"
              required
              disabled={disabled}
              defaultValue={record?.salary}
            />
          </label>
        </div>

        <SubmitButton
          label={record ? "Update finance entry" : "Save finance entry"}
          pendingLabel={record ? "Updating..." : "Saving..."}
          disabled={disabled}
        />
      </form>
    </FormSection>
  );
}
