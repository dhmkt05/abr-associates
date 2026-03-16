import Link from "next/link";
import { Search } from "lucide-react";
import { HelperForm } from "@/components/helpers/helper-form";
import { TopHeader } from "@/components/layout/top-header";
import { TableShell } from "@/components/table-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonClassName } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { FlashMessage } from "@/components/ui/flash-message";
import { Input } from "@/components/ui/input";
import { deleteHelperAction } from "@/lib/actions";
import { getHelpers } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/env";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function HelpersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    edit?: string;
    type?: "success" | "error";
    message?: string;
  }>;
}) {
  const params = await searchParams;
  const helpers = await getHelpers(params.q);
  const helperToEdit = helpers.find((helper) => helper.id === params.edit);
  const configured = isSupabaseConfigured();

  return (
    <div className="space-y-6">
      <FlashMessage type={params.type} message={params.message} />
      <TopHeader
        title="Helper Database"
        subtitle="Store helper profiles, salary expectations, work type, and current recruitment status."
        showSignOut={configured}
      />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <TableShell
          title="Helpers"
          description="Search, review, and maintain your helper database."
          actions={
            <form className="flex w-full flex-col gap-3 sm:max-w-md sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  name="q"
                  placeholder="Search helper ID, name, nationality..."
                  defaultValue={params.q}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="secondary" className="w-full sm:w-auto">
                Search
              </Button>
            </form>
          }
        >
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.18em] text-slate-400">
              <tr>
                {[
                  "Helper ID",
                  "Name",
                  "Nationality",
                  "Type",
                  "Experience",
                  "Salary",
                  "Status",
                  "Created",
                  "Actions",
                ].map((head) => (
                  <th key={head} className="px-3 py-3 font-medium">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {helpers.map((helper) => (
                <tr key={helper.id} className="border-t border-[var(--color-border)] text-slate-700">
                  <td className="px-3 py-4 font-semibold text-slate-900">{helper.helper_id}</td>
                  <td className="px-3 py-4">{helper.name}</td>
                  <td className="px-3 py-4">{helper.nationality}</td>
                  <td className="px-3 py-4">{helper.type}</td>
                  <td className="px-3 py-4">{helper.experience}</td>
                  <td className="px-3 py-4">{formatCurrency(helper.salary)}</td>
                  <td className="px-3 py-4">
                    <Badge
                      tone={
                        helper.status === "Available"
                          ? "success"
                          : helper.status === "Reserved"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {helper.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-4">{formatDate(helper.created_at)}</td>
                  <td className="px-3 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/helpers?edit=${helper.id}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`}
                        className={buttonClassName("secondary")}
                      >
                        Edit
                      </Link>
                      <form action={deleteHelperAction}>
                        <input type="hidden" name="id" value={helper.id} />
                        <input type="hidden" name="redirect_to" value="/helpers" />
                        <ConfirmSubmitButton
                          variant="danger"
                          type="submit"
                          disabled={!configured}
                          confirmMessage={`Delete helper ${helper.name}? This cannot be undone.`}
                        >
                          Delete
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>

        <HelperForm helper={helperToEdit} disabled={!configured} />
      </div>
    </div>
  );
}
