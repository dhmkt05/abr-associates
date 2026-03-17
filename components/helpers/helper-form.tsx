import { createHelperAction, updateHelperAction } from "@/lib/actions";
import type { Helper } from "@/lib/types";
import { FormSection } from "@/components/ui/form-section";
import { Input, Select } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

const helperTypes = ["my", "indo", "india", "other"] as const;

export function HelperForm({
  helper,
  disabled,
}: {
  helper?: Helper;
  disabled: boolean;
}) {
  const action = helper ? updateHelperAction : createHelperAction;

  return (
    <FormSection
      title={helper ? "Edit helper" : "Add helper"}
      description="Keep helper records short and quick to update for daily admin work."
    >
      <form action={action} className="mt-5 space-y-4">
        <input type="hidden" name="redirect_to" value="/helpers" />
        {helper ? <input type="hidden" name="id" value={helper.id} /> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Helper ID</span>
            <Input name="helper_id" defaultValue={helper?.helper_id} required disabled={disabled} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Name</span>
            <Input name="name" defaultValue={helper?.name} required disabled={disabled} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Country</span>
            <Input name="country" defaultValue={helper?.country} required disabled={disabled} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Type</span>
            <Select name="type" defaultValue={helper?.type ?? "other"} disabled={disabled}>
              {helperTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Added by</span>
            <Input
              name="added_by"
              defaultValue={helper?.added_by ?? "Admin"}
              required
              disabled={disabled}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Status</span>
            <Input
              name="status"
              defaultValue={helper?.status ?? "active"}
              required
              disabled={disabled}
            />
          </label>
        </div>

        <SubmitButton
          label={helper ? "Update helper" : "Save helper"}
          pendingLabel={helper ? "Updating..." : "Saving..."}
          disabled={disabled}
        />
      </form>
    </FormSection>
  );
}
