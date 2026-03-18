import { getCurrentUser } from "@/lib/supabase/server";
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
  ActivityLog,
  DashboardMetrics,
  Deal,
  DocumentationCase,
  DocumentationRow,
  Employer,
  FinanceRecord,
  FinanceRow,
  Helper,
  SalesRow,
  SalesStatus,
} from "@/lib/types";

function normalizeHelperType(value: string | null | undefined): Helper["type"] {
  if (value === "my" || value === "indo" || value === "india" || value === "other") {
    return value;
  }

  return "other";
}

function normalizeSalesStatus(value: string | null | undefined): SalesStatus {
  const normalized = (value ?? "").toLowerCase();

  if (normalized === "prospect") return "prospect";
  if (normalized === "interview going" || normalized === "interview") return "interview going";
  if (normalized === "negotiation") return "negotiation";
  if (normalized === "deal closed" || normalized === "confirmed") return "deal closed";
  if (normalized === "deal cancelled" || normalized === "cancelled" || normalized === "canceled") {
    return "deal cancelled";
  }

  return "prospect";
}

function normalizeDocumentationProcess(value: string | null | undefined): DocumentationCase["current_process"] {
  const normalized = (value ?? "").toLowerCase();

  if (normalized === "applying ipa" || normalized === "ipa") return "applying IPA";
  if (normalized === "work permit") return "work permit";
  if (normalized === "going to take flight") return "going to take flight";
  if (normalized === "flight ticket") return "flight ticket";
  if (normalized === "insurance") return "insurance";
  if (normalized === "work permit and going to take flight") return "work permit";
  if (normalized === "reach employer house" || normalized === "arrival") return "reach employer house";
  if (normalized === "medical follow up") return "medical follow up";

  return "applying IPA";
}

function normalizeUpfrontPaymentStatus(value: string | null | undefined): DocumentationCase["upfront_payment_status"] {
  return value?.toLowerCase() === "payment done" ? "payment done" : "prospect";
}

function mapHelper(row: Record<string, unknown>): Helper {
  return {
    id: String(row.id),
    helper_id: String(row.helper_id ?? ""),
    name: String(row.name ?? ""),
    country: String(row.country ?? row.nationality ?? ""),
    type: normalizeHelperType(String(row.type ?? "")),
    added_by: String(row.added_by ?? "Admin"),
    status: String(row.status ?? "active"),
    created_at: String(row.created_at ?? new Date().toISOString()),
  };
}

function mapEmployer(row: Record<string, unknown>): Employer {
  return {
    id: String(row.id),
    employer_id: String(row.employer_id ?? row.employer_code ?? `EMP-${String(row.id).slice(0, 8).toUpperCase()}`),
    employer_name: String(row.employer_name ?? ""),
    employer_number: String(row.employer_number ?? row.phone ?? ""),
    handled_by: String(row.handled_by ?? ""),
    status: normalizeSalesStatus(String(row.status ?? "")),
    created_at: String(row.created_at ?? new Date().toISOString()),
  };
}

function mapDeal(row: Record<string, unknown>): Deal {
  return {
    id: String(row.id),
    employer_id: String(row.employer_id ?? ""),
    helper_id: row.helper_id ? String(row.helper_id) : null,
    handled_by: String(row.handled_by ?? row.sales_staff ?? ""),
    status: normalizeSalesStatus(String(row.status ?? row.sales_stage ?? "")),
    notes: String(row.notes ?? ""),
    created_at: String(row.created_at ?? new Date().toISOString()),
  };
}

function mapDocumentationCase(row: Record<string, unknown>): DocumentationCase {
  return {
    id: String(row.id),
    deal_id: String(row.deal_id ?? ""),
    current_process: normalizeDocumentationProcess(String(row.current_process ?? row.stage ?? "")),
    upfront_payment_status: normalizeUpfrontPaymentStatus(
      String(row.upfront_payment_status ?? row.status ?? ""),
    ),
    created_at: String(row.created_at ?? new Date().toISOString()),
  };
}

function mapFinance(row: Record<string, unknown>): FinanceRecord {
  return {
    id: String(row.id),
    deal_id: row.deal_id ? String(row.deal_id) : null,
    reference: String(row.reference ?? ""),
    amount_received: Number(row.amount_received ?? 0),
    supplier_payment: Number(row.supplier_payment ?? 0),
    office_expense: Number(row.office_expense ?? 0),
    salary: Number(row.salary ?? 0),
    profit: Number(row.profit ?? 0),
    created_at: String(row.created_at ?? new Date().toISOString()),
  };
}

function withRelations(
  deals: Deal[],
  employers: Employer[],
  helpers: Helper[],
): SalesRow[] {
  return deals.map((deal) => ({
    ...deal,
    employer: employers.find((employer) => employer.id === deal.employer_id),
    helper: deal.helper_id
      ? helpers.find((helper) => helper.id === deal.helper_id) ?? null
      : null,
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
    deal: record.deal_id ? salesRows.find((deal) => deal.id === record.deal_id) : undefined,
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
      supabase.from("documentation_cases").select("*").order("created_at", { ascending: false }),
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
    helpers: (helpersResult.data ?? []).map((row) => mapHelper(row as Record<string, unknown>)),
    employers: (employersResult.data ?? []).map((row) => mapEmployer(row as Record<string, unknown>)),
    deals: (dealsResult.data ?? []).map((row) => mapDeal(row as Record<string, unknown>)),
    documentationCases: (documentationResult.data ?? []).map((row) =>
      mapDocumentationCase(row as Record<string, unknown>),
    ),
    finance: (financeResult.data ?? []).map((row) => mapFinance(row as Record<string, unknown>)),
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
  const documentation = withDocumentationRelations(tables.documentationCases, sales);
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
    [helper.helper_id, helper.name, helper.country, helper.type, helper.added_by, helper.status]
      .join(" ")
      .toLowerCase()
      .includes(term),
  );
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const { helpers, deals, documentation, finance } = await getAppData();

  return {
    totalHelpers: helpers.length,
    activeLeads: deals.filter(
      (deal) => deal.status !== "deal closed" && deal.status !== "deal cancelled",
    ).length,
    dealsConfirmed: deals.filter((deal) => deal.status === "deal closed").length,
    documentationCases: documentation.length,
    revenue: finance.reduce((total, item) => total + item.amount_received, 0),
    profit: finance.reduce((total, item) => total + item.profit, 0),
  };
}

export async function getRecentActivity(): Promise<ActivityItem[]> {
  const supabase = await getSupabaseServerClient();
  const user = await getCurrentUser();

  if (supabase && user) {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8);

    if (!error && data) {
      return (data as ActivityLog[]).map((item) => ({
        id: item.id,
        title: item.action.replaceAll("_", " "),
        description: item.description,
        created_at: item.created_at,
        category:
          item.entity_type === "helper"
            ? "helper"
            : item.entity_type === "documentation_case"
              ? "documentation"
              : item.entity_type === "deal"
                ? "deal"
                : "finance",
      }));
    }
  }

  const { helpers, deals, documentation, finance } = await getAppData();

  return [
    ...helpers.map((helper) => ({
      id: `helper-${helper.id}`,
      title: `Helper updated: ${helper.name}`,
      description: `${helper.helper_id} · ${helper.country} · ${helper.status}`,
      created_at: helper.created_at,
      category: "helper" as const,
    })),
    ...deals.map((deal) => ({
      id: `deal-${deal.id}`,
      title: `Sales status: ${deal.employer?.employer_name ?? "Employer"}`,
      description: `${deal.status} · ${deal.handled_by || "Admin"}${deal.notes ? ` · ${deal.notes}` : ""}`,
      created_at: deal.created_at,
      category: "deal" as const,
    })),
    ...documentation.map((record) => ({
      id: `documentation-${record.id}`,
      title: `Documentation: ${record.current_process}`,
      description: `${record.deal?.employer?.employer_name ?? "Employer"} · ${record.upfront_payment_status}`,
      created_at: record.created_at,
      category: "documentation" as const,
    })),
    ...finance.map((record) => ({
      id: `finance-${record.id}`,
      title: "Finance entry recorded",
      description: `${record.reference || record.deal?.employer?.employer_name || "Reference"} · Profit ${record.profit}`,
      created_at: record.created_at,
      category: "finance" as const,
    })),
  ]
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    .slice(0, 8);
}

export async function getActivityLogs() {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return [] as ActivityLog[];
  }

  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) {
    return [] as ActivityLog[];
  }

  return data as ActivityLog[];
}
