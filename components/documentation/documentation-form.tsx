import Link from "next/link";
import {
  createDocumentationAction,
  updateDocumentationAction,
} from "@/lib/actions";
import type { DocumentationRow, SalesRow } from "@/lib/types";
import { FormSection } from "@/components/ui/form-section";
import { buttonClassName } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

const processOptions = [
  "applying IPA",
  "work permit",
  "going to take flight",
  "flight ticket",
  "insurance",
  "reach employer house",
  "medical follow up",
] as const;

const upfrontOptions = ["prospect", "payment done"] as const;

export function DocumentationForm({
  deals,
  disabled,
  record,
  redirectTo = "/documentation",
  cancelHref = "/documentation",
}: {
  deals: SalesRow[];
  disabled: boolean;
  record?: DocumentationRow;
  redirectTo?: string;
  cancelHref?: string;
}) {
  const action = record ? updateDocumentationAction : createDocumentationAction;
  const currentDeal =
    record?.deal_id ? deals.find((deal) => deal.id === record.deal_id) : undefined;
  const closedDeals = deals.filter((deal) => deal.status === "deal closed");
  const selectableDeals = currentDeal
    ? [currentDeal, ...closedDeals.filter((deal) => deal.id !== currentDeal.id)]
    : closedDeals;

  return (
    <FormSection
      title={record ? "Edit documentation record" : "Add documentation record"}
      description="Documentation uses closed sales records so employer details do not need to be entered again."
    >
      <form action={action} className="mt-5 space-y-4">
        <input type="hidden" name="redirect_to" value={redirectTo} />
        {record ? <input type="hidden" name="id" value={record.id} /> : null}
        {record ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Editing existing documentation record</p>
              <p className="text-amber-800">
                Saving will update the current documentation row instead of adding another one.
              </p>
            </div>
            <Link href={cancelHref} className={buttonClassName("secondary")}>
              Cancel edit
            </Link>
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Closed sales record</span>
            <Select
              name="deal_id"
              required
              disabled={disabled}
              defaultValue={record?.deal_id}
            >
              {selectableDeals.map((deal) => (
                <option key={deal.id} value={deal.id}>
                  {deal.employer?.employer_id} · {deal.employer?.employer_name} · {deal.employer?.employer_number}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Current process</span>
            <Select
              name="current_process"
              required
              disabled={disabled}
              defaultValue={record?.current_process ?? "applying IPA"}
            >
              {processOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Upfront payment status</span>
            <Select
              name="upfront_payment_status"
              required
              disabled={disabled}
              defaultValue={record?.upfront_payment_status ?? "prospect"}
            >
              {upfrontOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </label>
        </div>

        <SubmitButton
          label={record ? "Update documentation" : "Save documentation"}
          pendingLabel={record ? "Updating..." : "Saving..."}
          disabled={disabled || (!record && selectableDeals.length === 0)}
        />
      </form>
    </FormSection>
  );
}
