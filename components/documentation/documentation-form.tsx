import {
  createDocumentationAction,
  updateDocumentationAction,
} from "@/lib/actions";
import type { DocumentationRow, SalesRow } from "@/lib/types";
import { FormSection } from "@/components/ui/form-section";
import { Input, Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

export function DocumentationForm({
  deals,
  disabled,
  record,
}: {
  deals: SalesRow[];
  disabled: boolean;
  record?: DocumentationRow;
}) {
  const action = record ? updateDocumentationAction : createDocumentationAction;

  return (
    <FormSection
      title={record ? "Edit documentation case" : "Add documentation case"}
      description="Track permit, visa, travel, and payment milestones after a sales confirmation."
    >
      <form action={action} className="mt-5 space-y-4">
        <input type="hidden" name="redirect_to" value="/documentation" />
        {record ? <input type="hidden" name="id" value={record.id} /> : null}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Deal</span>
            <Select
              name="deal_id"
              required
              disabled={disabled}
              defaultValue={record?.deal_id}
            >
              {deals.map((deal) => (
                <option key={deal.id} value={deal.id}>
                  {deal.employer?.employer_name} - {deal.helper?.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Stage</span>
            <Select name="stage" required disabled={disabled} defaultValue={record?.stage}>
              <option>Contract</option>
              <option>Work Permit</option>
              <option>IPA</option>
              <option>Visa</option>
              <option>Flight Ticket</option>
              <option>Insurance</option>
              <option>Travel</option>
              <option>Arrival</option>
              <option>First Month Payment</option>
            </Select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Assigned staff</span>
            <Input
              name="assigned_staff"
              required
              disabled={disabled}
              defaultValue={record?.assigned_staff}
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Status</span>
            <Input
              name="status"
              placeholder="Pending / Submitted / Completed"
              required
              disabled={disabled}
              defaultValue={record?.status}
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Remarks</span>
            <Textarea name="remarks" disabled={disabled} defaultValue={record?.remarks} />
          </label>
        </div>

        <SubmitButton
          label={record ? "Update case" : "Create case"}
          pendingLabel={record ? "Updating..." : "Saving..."}
          disabled={disabled}
        />
      </form>
    </FormSection>
  );
}
