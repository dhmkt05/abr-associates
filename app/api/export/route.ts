import { NextResponse } from "next/server";
import { getCurrentUserProfile } from "@/lib/auth";
import { getAppData } from "@/lib/data";
import { getSession } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

function escapeCsv(value: string | number | undefined) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  if (isSupabaseConfigured()) {
    const session = await getSession();
    const profile = await getCurrentUserProfile();

    if (!session || profile?.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "report";
  const month = url.searchParams.get("month");
  const staff = url.searchParams.get("staff");
  const { deals, finance } = await getAppData();

  const filteredDeals = deals.filter((deal) => {
    const dealMonth = new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
    }).format(new Date(deal.created_at));

    return (month ? dealMonth === month : true) && (staff ? deal.sales_staff === staff : true);
  });

  const rows =
    type === "finance"
      ? finance.map((record) => [
          record.created_at,
          record.deal?.employer?.employer_name,
          record.amount_received,
          record.supplier_payment,
          record.office_expense,
          record.profit,
        ])
      : filteredDeals.map((deal) => [
          deal.created_at,
          deal.employer?.employer_name,
          deal.helper?.name,
          deal.sales_staff,
          deal.sales_stage,
          deal.expected_amount,
        ]);

  const headers =
    type === "finance"
      ? ["Date", "Employer", "Amount Received", "Supplier Payment", "Office Expense", "Profit"]
      : ["Date", "Employer", "Helper", "Sales Staff", "Stage", "Expected Amount"];

  const csv = [headers, ...rows]
    .map((row) => row.map((value) => escapeCsv(value)).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type}-export.csv"`,
    },
  });
}
