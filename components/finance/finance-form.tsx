import type { SalesRow } from "@/lib/types";
import { createFinanceAction, updateFinanceAction } from "@/lib/actions";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import type { FinanceRow } from "@/lib/types";

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

  return (
    <Card>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          {record ? "Edit finance record" : "Add finance record"}
        </h3>
        <p className="text-sm text-slate-500">
          Profit is calculated automatically as amount received minus supplier payment and office expense.
        </p>
      </div>

      <form action={action} className="mt-5 space-y-4">
        <input type="hidden" name="redirect_to" value="/finance" />
        {record ? <input type="hidden" name="id" value={record.id} /> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Deal</span>
            <Select name="deal_id" required disabled={disabled} defaultValue={record?.deal_id}>
              {deals.map((deal) => (
                <option key={deal.id} value={deal.id}>
                  {deal.employer?.employer_name} - {deal.helper?.name}
                </option>
              ))}
            </Select>
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
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Office expense</span>
            <Input
              name="office_expense"
              type="number"
              required
              disabled={disabled}
              defaultValue={record?.office_expense}
            />
          </label>
        </div>

        <SubmitButton
          label={record ? "Update finance entry" : "Save finance entry"}
          pendingLabel={record ? "Updating..." : "Saving..."}
          disabled={disabled}
        />
      </form>
    </Card>
  );
}
