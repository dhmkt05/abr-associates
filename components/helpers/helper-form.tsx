import { createHelperAction, updateHelperAction } from "@/lib/actions";
import type { Helper } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

export function HelperForm({
  helper,
  disabled,
}: {
  helper?: Helper;
  disabled: boolean;
}) {
  const action = helper ? updateHelperAction : createHelperAction;

  return (
    <Card>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          {helper ? "Edit helper" : "Add helper"}
        </h3>
        <p className="text-sm text-slate-500">
          Maintain profile details used by the sales and documentation teams.
        </p>
      </div>

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
            <span className="mb-2 block text-sm font-medium text-slate-700">Nationality</span>
            <Input name="nationality" defaultValue={helper?.nationality} required disabled={disabled} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Type</span>
            <Input
              name="type"
              defaultValue={helper?.type}
              placeholder="Transfer / Fresh / Ex-Singapore"
              required
              disabled={disabled}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Experience</span>
            <Input name="experience" defaultValue={helper?.experience} required disabled={disabled} />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Salary</span>
            <Input name="salary" type="number" defaultValue={helper?.salary} required disabled={disabled} />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Status</span>
            <Select name="status" defaultValue={helper?.status ?? "Available"} disabled={disabled}>
              <option>Available</option>
              <option>Reserved</option>
              <option>Placed</option>
              <option>Inactive</option>
            </Select>
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Skills</span>
            <Textarea name="skills" defaultValue={helper?.skills} disabled={disabled} />
          </label>
        </div>

        <SubmitButton
          label={helper ? "Update helper" : "Save helper"}
          pendingLabel={helper ? "Updating..." : "Saving..."}
          disabled={disabled}
        />
      </form>
    </Card>
  );
}
