"use client";

import Link from "next/link";
import { useState } from "react";
import { createDealAction, updateDealAction } from "@/lib/actions";
import type { SalesRow, SalesStatus } from "@/lib/types";
import { FormSection } from "@/components/ui/form-section";
import { buttonClassName } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

const salesStatuses = [
  "prospect",
  "interview going",
  "negotiation",
  "deal closed",
  "deal cancelled",
] as const;

export function DealForm({
  disabled,
  deal,
}: {
  disabled: boolean;
  deal?: SalesRow;
}) {
  const action = deal ? updateDealAction : createDealAction;
  const [status, setStatus] = useState<SalesStatus>(deal?.status ?? "prospect");
  const notesRequired = status === "deal cancelled";

  return (
    <FormSection
      title={deal ? "Edit sales entry" : "Add sales entry"}
      description="Keep employer lead updates short so status changes can be recorded quickly."
    >
      <form action={action} className="mt-5 space-y-4">
        <input type="hidden" name="redirect_to" value="/sales" />
        {deal ? <input type="hidden" name="id" value={deal.id} /> : null}
        {deal?.employer ? <input type="hidden" name="employer_record_id" value={deal.employer.id} /> : null}
        {deal ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Editing existing sales entry</p>
              <p className="text-amber-800">
                Saving will update {deal.employer?.employer_name ?? "this employer"} instead of creating a new row.
              </p>
            </div>
            <Link href="/sales" className={buttonClassName("secondary")}>
              Cancel edit
            </Link>
          </div>
        ) : null}
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
            <Select
              name="status"
              value={status}
              disabled={disabled}
              onChange={(event) => setStatus(event.target.value as SalesStatus)}
            >
              {salesStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </label>
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-slate-700">Notes / Reason</span>
            <Textarea
              name="notes"
              defaultValue={deal?.notes ?? ""}
              required={notesRequired}
              disabled={disabled}
              placeholder="Add cancellation reason or any extra sales notes."
            />
            <span className="mt-2 block text-xs text-slate-500">
              {notesRequired
                ? "Notes are required when the deal is marked as cancelled."
                : "Use this for cancellation reasons or any extra comments."}
            </span>
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
