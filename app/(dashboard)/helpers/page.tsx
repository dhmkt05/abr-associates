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

      <div className="space-y-6">
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
          <div className="space-y-4 lg:hidden">
            {helpers.map((helper) => (
              <article
                key={helper.id}
                className="rounded-2xl border border-[var(--color-border)] bg-white/80 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      {helper.helper_id}
                    </p>
                    <h4 className="mt-1 text-lg font-semibold text-slate-900">{helper.name}</h4>
                  </div>
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
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Nationality</p>
                    <p className="mt-1 font-medium text-slate-900">{helper.nationality}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Type</p>
                    <p className="mt-1 font-medium text-slate-900">{helper.type}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Experience</p>
                    <p className="mt-1 font-medium text-slate-900">{helper.experience}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Salary</p>
                    <p className="mt-1 font-medium text-slate-900">{formatCurrency(helper.salary)}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Link
                    href={`/helpers?edit=${helper.id}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`}
                    className={`${buttonClassName("secondary")} w-full sm:w-auto`}
                  >
                    Edit
                  </Link>
                  <form action={deleteHelperAction} className="w-full sm:w-auto">
                    <input type="hidden" name="id" value={helper.id} />
                    <input type="hidden" name="redirect_to" value="/helpers" />
                    <ConfirmSubmitButton
                      variant="danger"
                      type="submit"
                      className="w-full sm:w-auto"
                      disabled={!configured}
                      confirmMessage={`Delete helper ${helper.name}? This cannot be undone.`}
                    >
                      Delete
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </article>
            ))}
          </div>

          <table className="hidden min-w-full text-left text-sm lg:table">
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

        <div className="max-w-4xl">
          <HelperForm helper={helperToEdit} disabled={!configured} />
        </div>
      </div>
    </div>
  );
}
