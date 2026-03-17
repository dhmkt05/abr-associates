import { createDealAction, updateDealAction } from "@/lib/actions";
import type { SalesRow } from "@/lib/types";
import { FormSection } from "@/components/ui/form-section";
import { Input, Select } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

const salesStatuses = [
  "prospect",
  "interview going",
  "negotiation",
  "deal closed",
] as const;

export function DealForm({
  disabled,
  deal,
}: {
  disabled: boolean;
  deal?: SalesRow;
}) {
  const action = deal ? updateDealAction : createDealAction;

  return (
    <FormSection
      title={deal ? "Edit sales entry" : "Add sales entry"}
      description="Keep employer lead updates short so status changes can be recorded quickly."
    >
      <form action={action} className="mt-5 space-y-4">
        <input type="hidden" name="redirect_to" value="/sales" />
        {deal ? <input type="hidden" name="id" value={deal.id} /> : null}
        {deal?.employer ? <input type="hidden" name="employer_record_id" value={deal.employer.id} /> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Employer ID</span>
            <Input
              name="employer_id"
              defaultValue={deal?.employer?.employer_id}
              required
              disabled={disabled}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Employer name</span>
            <Input
              name="employer_name"
              defaultValue={deal?.employer?.employer_name}
              required
              disabled={disabled}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Employer number</span>
            <Input
              name="employer_number"
              defaultValue={deal?.employer?.employer_number}
              required
              disabled={disabled}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Handled by</span>
            <Input
              name="handled_by"
              defaultValue={deal?.handled_by ?? deal?.employer?.handled_by ?? "Admin"}
              required
              disabled={disabled}
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Status</span>
            <Select name="status" defaultValue={deal?.status ?? "prospect"} disabled={disabled}>
              {salesStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </label>
        </div>

        <SubmitButton
          label={deal ? "Update sales entry" : "Save sales entry"}
          pendingLabel={deal ? "Updating..." : "Saving..."}
          disabled={disabled}
        />
      </form>
    </FormSection>
  );
}
