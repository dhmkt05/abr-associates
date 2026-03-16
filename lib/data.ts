import {
  demoDeals,
  demoDocumentationCases,
  demoEmployers,
  demoFinance,
  demoHelpers,
} from "@/lib/demo-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ActivityItem,
  DashboardMetrics,
  Deal,
  DocumentationCase,
  DocumentationRow,
  Employer,
  FinanceRecord,
  FinanceRow,
  Helper,
  SalesRow,
} from "@/lib/types";

function withRelations(
  deals: Deal[],
  employers: Employer[],
  helpers: Helper[],
): SalesRow[] {
  return deals.map((deal) => ({
    ...deal,
    employer: employers.find((employer) => employer.id === deal.employer_id),
    helper: helpers.find((helper) => helper.id === deal.helper_id),
  }));
}

function withDocumentationRelations(
  documentationCases: DocumentationCase[],
  salesRows: SalesRow[],
): DocumentationRow[] {
  return documentationCases.map((record) => ({
    ...record,
    deal: salesRows.find((deal) => deal.id === record.deal_id),
  }));
}

function withFinanceRelations(
  finance: FinanceRecord[],
  salesRows: SalesRow[],
): FinanceRow[] {
  return finance.map((record) => ({
    ...record,
    deal: salesRows.find((deal) => deal.id === record.deal_id),
  }));
}

async function getSupabaseTables() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const [helpersResult, employersResult, dealsResult, documentationResult, financeResult] =
    await Promise.all([
      supabase.from("helpers").select("*").order("created_at", { ascending: false }),
      supabase.from("employers").select("*").order("created_at", { ascending: false }),
      supabase.from("deals").select("*").order("created_at", { ascending: false }),
      supabase
        .from("documentation_cases")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("finance").select("*").order("created_at", { ascending: false }),
    ]);

  const errors = [
    helpersResult.error?.message,
    employersResult.error?.message,
    dealsResult.error?.message,
    documentationResult.error?.message,
    financeResult.error?.message,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(`Supabase query failed: ${errors.join(" | ")}`);
  }

  return {
    helpers: (helpersResult.data ?? []) as Helper[],
    employers: (employersResult.data ?? []) as Employer[],
    deals: (dealsResult.data ?? []) as Deal[],
    documentationCases: (documentationResult.data ?? []) as DocumentationCase[],
    finance: (financeResult.data ?? []) as FinanceRecord[],
  };
}

export async function getAppData() {
  const tables = (await getSupabaseTables()) ?? {
    helpers: demoHelpers,
    employers: demoEmployers,
    deals: demoDeals,
    documentationCases: demoDocumentationCases,
    finance: demoFinance,
  };

  const sales = withRelations(tables.deals, tables.employers, tables.helpers);
  const documentation = withDocumentationRelations(
    tables.documentationCases,
    sales,
  );
  const finance = withFinanceRelations(tables.finance, sales);

  return {
    helpers: tables.helpers,
    employers: tables.employers,
    deals: sales,
    documentation,
    finance,
  };
}

export async function getHelpers(search?: string) {
  const { helpers } = await getAppData();

  if (!search) {
    return helpers;
  }

  const term = search.toLowerCase();
  return helpers.filter((helper) =>
    [helper.helper_id, helper.name, helper.nationality, helper.type, helper.status]
      .join(" ")
      .toLowerCase()
      .includes(term),
  );
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const { helpers, deals, documentation, finance } = await getAppData();

  return {
    totalHelpers: helpers.length,
    activeLeads: deals.filter((deal) => deal.sales_stage !== "Confirmed").length,
    dealsConfirmed: deals.filter((deal) => deal.sales_stage === "Confirmed").length,
    documentationCases: documentation.length,
    revenue: finance.reduce((total, item) => total + item.amount_received, 0),
    profit: finance.reduce((total, item) => total + item.profit, 0),
  };
}

export async function getRecentActivity(): Promise<ActivityItem[]> {
  const { helpers, deals, documentation, finance } = await getAppData();

  return [
    ...helpers.map((helper) => ({
      id: `helper-${helper.id}`,
      title: `Helper added: ${helper.name}`,
      description: `${helper.helper_id} · ${helper.status}`,
      created_at: helper.created_at,
      category: "helper" as const,
    })),
    ...deals.map((deal) => ({
      id: `deal-${deal.id}`,
      title: `Sales stage: ${deal.employer?.employer_name ?? "Employer"}`,
      description: `${deal.sales_stage} with ${deal.helper?.name ?? "No helper assigned"}`,
      created_at: deal.created_at,
      category: "deal" as const,
    })),
    ...documentation.map((record) => ({
      id: `documentation-${record.id}`,
      title: `Documentation: ${record.stage}`,
      description: `${record.deal?.employer?.employer_name ?? "Employer"} · ${record.status}`,
      created_at: record.created_at,
      category: "documentation" as const,
    })),
    ...finance.map((record) => ({
      id: `finance-${record.id}`,
      title: "Finance entry recorded",
      description: `${record.deal?.employer?.employer_name ?? "Employer"} · Profit ${record.profit}`,
      created_at: record.created_at,
      category: "finance" as const,
    })),
  ]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 8);
}
