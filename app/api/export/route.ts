import { NextResponse } from "next/server";
import { getCurrentUserProfile } from "@/lib/auth";
import { getCurrentUser } from "@/lib/supabase/server";
import { getAppData } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/env";

function escapeCsv(value: string | number | undefined | null) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  if (isSupabaseConfigured()) {
    const user = await getCurrentUser();
    const profile = await getCurrentUserProfile();

    if (!user || profile?.role !== "admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "report";
  const month = url.searchParams.get("month");
  const handler = url.searchParams.get("handler");
  const { deals, finance } = await getAppData();

  const filteredDeals = deals.filter((deal) => {
    const dealMonth = new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
    }).format(new Date(deal.created_at));

    return (month ? dealMonth === month : true) && (handler ? deal.handled_by === handler : true);
  });

  const rows =
    type === "finance"
      ? finance.map((record) => [
          record.created_at,
          record.reference || record.deal?.employer?.employer_name,
          record.amount_received,
          record.supplier_payment,
          record.office_expense,
          record.salary,
          record.profit,
        ])
      : filteredDeals.map((deal) => [
          deal.created_at,
          deal.employer?.employer_id,
          deal.employer?.employer_name,
          deal.employer?.employer_number,
          deal.handled_by,
          deal.status,
        ]);

  const headers =
    type === "finance"
      ? ["Date", "Reference", "Amount Received", "Supplier Payment", "Office Expense", "Salary", "Profit"]
      : ["Date", "Employer ID", "Employer Name", "Employer Number", "Handled By", "Status"];

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
