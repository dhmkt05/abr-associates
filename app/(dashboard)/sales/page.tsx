import { TopHeader } from "@/components/layout/top-header";
import { DealForm } from "@/components/sales/deal-form";
import { TableShell } from "@/components/table-shell";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { ConfirmSubmitButton } from "@/components/ui/confirm-submit-button";
import { FlashMessage } from "@/components/ui/flash-message";
import Link from "next/link";
import { deleteDealAction } from "@/lib/actions";
import { getAppData } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/env";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{
    edit?: string;
    type?: "success" | "error";
    message?: string;
  }>;
}) {
  const params = await searchParams;
  const { deals, employers, helpers } = await getAppData();
  const dealToEdit = deals.find((deal) => deal.id === params.edit);
  const configured = isSupabaseConfigured();

  return (
    <div className="space-y-6">
      <FlashMessage type={params.type} message={params.message} />
      <TopHeader
        title="Sales Pipeline"
        subtitle="Manage employer leads, helper matching, staff ownership, and expected revenue."
        showSignOut={configured}
      />

      <div className="space-y-6">
        <TableShell
          title="Leads and deals"
          description="Track each employer from first contact to confirmed placement."
        >
          <div className="space-y-4 lg:hidden">
            {deals.map((deal) => (
              <article
                key={deal.id}
                className="rounded-2xl border border-[var(--color-border)] bg-white/80 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      {deal.employer?.country}
                    </p>
                    <h4 className="mt-1 text-lg font-semibold text-slate-900">
                      {deal.employer?.employer_name}
                    </h4>
                    <p className="mt-1 text-sm text-slate-600">{deal.helper?.name}</p>
                  </div>
                  <Badge
                    tone={
                      deal.sales_stage === "Confirmed"
                        ? "success"
                        : deal.sales_stage === "Negotiation"
                          ? "warning"
                          : "accent"
                    }
                  >
                    {deal.sales_stage}
                  </Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Staff</p>
                    <p className="mt-1 font-medium text-slate-900">{deal.sales_staff}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Amount</p>
                    <p className="mt-1 font-medium text-slate-900">
                      {formatCurrency(deal.expected_amount)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Link href={`/sales?edit=${deal.id}`} className={`${buttonClassName("secondary")} w-full sm:w-auto`}>
                    Edit
                  </Link>
                  <form action={deleteDealAction} className="w-full sm:w-auto">
                    <input type="hidden" name="id" value={deal.id} />
                    <input type="hidden" name="redirect_to" value="/sales" />
                    <ConfirmSubmitButton
                      variant="danger"
                      type="submit"
                      className="w-full sm:w-auto"
                      disabled={!configured}
                      confirmMessage={`Delete the lead for ${deal.employer?.employer_name}?`}
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
                  "Employer Name",
                  "Country",
                  "Helper Selected",
                  "Sales Staff",
                  "Stage",
                  "Expected Amount",
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
              {deals.map((deal) => (
                <tr key={deal.id} className="border-t border-[var(--color-border)] text-slate-700">
                  <td className="px-3 py-4 font-semibold text-slate-900">{deal.employer?.employer_name}</td>
                  <td className="px-3 py-4">{deal.employer?.country}</td>
                  <td className="px-3 py-4">{deal.helper?.name}</td>
                  <td className="px-3 py-4">{deal.sales_staff}</td>
                  <td className="px-3 py-4">
                    <Badge
                      tone={
                        deal.sales_stage === "Confirmed"
                          ? "success"
                          : deal.sales_stage === "Negotiation"
                            ? "warning"
                            : "accent"
                      }
                    >
                      {deal.sales_stage}
                    </Badge>
                  </td>
                  <td className="px-3 py-4">{formatCurrency(deal.expected_amount)}</td>
                  <td className="px-3 py-4">{formatDate(deal.created_at)}</td>
                  <td className="px-3 py-4">
                    <div className="flex gap-2">
                      <Link href={`/sales?edit=${deal.id}`} className={buttonClassName("secondary")}>
                        Edit
                      </Link>
                      <form action={deleteDealAction}>
                        <input type="hidden" name="id" value={deal.id} />
                        <input type="hidden" name="redirect_to" value="/sales" />
                        <ConfirmSubmitButton
                          variant="danger"
                          type="submit"
                          disabled={!configured}
                          confirmMessage={`Delete the lead for ${deal.employer?.employer_name}?`}
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
          <DealForm
            helpers={helpers}
            employers={employers}
            disabled={!configured}
            deal={dealToEdit}
          />
        </div>
      </div>
    </div>
  );
}
