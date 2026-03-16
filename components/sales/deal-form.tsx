import { createDealAction, updateDealAction } from "@/lib/actions";
import type { Employer, Helper, SalesRow } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

export function DealForm({
  helpers,
  employers,
  disabled,
  deal,
}: {
  helpers: Helper[];
  employers: Employer[];
  disabled: boolean;
  deal?: SalesRow;
}) {
  const action = deal ? updateDealAction : createDealAction;
  const hasHelpers = helpers.length > 0;
  const helperSelectDisabled = disabled || (!deal && !hasHelpers);
  const submitDisabled = disabled || (!deal && !hasHelpers);

  return (
    <Card>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          {deal ? "Edit sales lead" : "Add sales lead"}
        </h3>
        <p className="text-sm text-slate-500">
          Create a lead and optionally register a new employer on the same form.
        </p>
        {!hasHelpers && !deal ? (
          <p className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Add at least one helper in the Helpers page before creating a sales lead.
          </p>
        ) : null}
      </div>

      <form action={action} className="mt-5 space-y-4">
        <input type="hidden" name="redirect_to" value="/sales" />
        {deal ? <input type="hidden" name="id" value={deal.id} /> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Existing employer</span>
            <Select
              name="employer_id"
              defaultValue={deal?.employer_id ?? ""}
              disabled={disabled}
            >
              <option value="">Create a new employer instead</option>
              {employers.map((employer) => (
                <option key={employer.id} value={employer.id}>
                  {employer.employer_name}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">New employer name</span>
            <Input
              name="employer_name"
              placeholder="Only if employer is new"
              disabled={disabled || Boolean(deal)}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Country</span>
            <Input name="country" placeholder="Singapore" disabled={disabled || Boolean(deal)} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Phone</span>
            <Input name="phone" placeholder="+65..." disabled={disabled || Boolean(deal)} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Helper selected</span>
            <Select
              name="helper_id"
              required={hasHelpers || Boolean(deal)}
              disabled={helperSelectDisabled}
              defaultValue={deal?.helper_id ?? ""}
            >
              {!deal ? (
                <option value="" disabled>
                  {hasHelpers ? "Select a helper" : "No helpers available yet"}
                </option>
              ) : null}
              {helpers.map((helper) => (
                <option key={helper.id} value={helper.id}>
                  {helper.name} ({helper.helper_id}) · {helper.status}
                </option>
              ))}
            </Select>
            {hasHelpers ? (
              <p className="mt-2 text-xs text-slate-500">
                Tip: create deals from helpers marked `Available` or `Reserved`.
              </p>
            ) : null}
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Sales staff</span>
            <Input
              name="sales_staff"
              required
              disabled={disabled}
              defaultValue={deal?.sales_staff}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Stage</span>
            <Select
              name="sales_stage"
              defaultValue={deal?.sales_stage ?? "New Lead"}
              disabled={disabled}
            >
              <option>New Lead</option>
              <option>Interview</option>
              <option>Negotiation</option>
              <option>Confirmed</option>
            </Select>
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Expected amount</span>
            <Input
              name="expected_amount"
              type="number"
              required
              disabled={disabled}
              defaultValue={deal?.expected_amount}
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Notes</span>
            <Textarea name="notes" disabled={disabled} defaultValue={deal?.notes} />
          </label>
          <input type="hidden" name="employer_notes" value="" />
        </div>

        <SubmitButton
          label={deal ? "Update lead" : "Create lead"}
          pendingLabel={deal ? "Updating..." : "Creating..."}
          disabled={submitDisabled}
        />
      </form>
    </Card>
  );
}
