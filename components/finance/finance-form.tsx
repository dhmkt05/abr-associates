import type { FinanceRow, SalesRow } from "@/lib/types";
import { createFinanceAction, updateFinanceAction } from "@/lib/actions";
import { FormSection } from "@/components/ui/form-section";
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
  const closedDeals = deals.filter((deal) => deal.status === "deal closed");

  return (
    <FormSection
      title={record ? "Edit finance record" : "Add finance record"}
      description="Use a deal link when available, or type a direct reference for quick finance updates."
    >
      <form action={action} className="mt-5 space-y-4">
        <input type="hidden" name="redirect_to" value="/finance" />
        {record ? <input type="hidden" name="id" value={record.id} /> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Closed deal link</span>
            <Select name="deal_id" disabled={disabled} defaultValue={record?.deal_id ?? ""}>
              <option value="">No linked deal</option>
              {closedDeals.map((deal) => (
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
