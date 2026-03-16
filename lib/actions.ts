"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logActivity } from "@/lib/activity";
import {
  getCurrentUserProfile,
} from "@/lib/auth";
import {
  canManageDocumentation,
  canManageFinance,
  canManageHelpers,
  canManageSales,
  roleLandingPath,
} from "@/lib/rbac";
import { isSupabaseConfigured } from "@/lib/env";
import type { AppRole } from "@/lib/types";
import { buildRedirectUrl, parseNumber } from "@/lib/utils";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function ensureConfigured() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }
}

function revalidateDashboardRoutes() {
  [
    "/dashboard",
    "/helpers",
    "/sales",
    "/documentation",
    "/finance",
    "/reports",
    "/settings",
  ].forEach((path) => revalidatePath(path));
}

function getRedirectTo(formData: FormData, fallback: string) {
  return String(formData.get("redirect_to") ?? fallback);
}

function redirectWithMessage(
  redirectTo: string,
  type: "success" | "error",
  message: string,
) {
  redirect(
    buildRedirectUrl(redirectTo, {
      type,
      message,
    }),
  );
}

async function requireActionRole(
  area: "helpers" | "sales" | "documentation" | "finance",
) {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/access-denied?reason=missing-profile");
  }

  const allowed =
    area === "helpers"
      ? canManageHelpers(profile.role)
      : area === "sales"
        ? canManageSales(profile.role)
        : area === "documentation"
          ? canManageDocumentation(profile.role)
          : canManageFinance(profile.role);

  if (!allowed) {
    redirect("/access-denied");
  }

  return profile;
}

export async function loginAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const { data, error } = await supabase!.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const { data: profile } = await supabase!
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/login?error=No role assigned to this account.");
  }

  redirect(roleLandingPath[profile.role as AppRole]);
}

export async function signOutAction() {
  const supabase = await getSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/login");
}

export async function createHelperAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  await requireActionRole("helpers");
  const redirectTo = getRedirectTo(formData, "/helpers");

  const { data, error } = await supabase!.from("helpers").insert({
    helper_id: String(formData.get("helper_id") ?? ""),
    name: String(formData.get("name") ?? ""),
    nationality: String(formData.get("nationality") ?? ""),
    type: String(formData.get("type") ?? ""),
    experience: String(formData.get("experience") ?? ""),
    skills: String(formData.get("skills") ?? ""),
    salary: parseNumber(formData.get("salary")),
    status: String(formData.get("status") ?? "Available"),
  }).select("id,name,helper_id").single();

  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  if (data) {
    await logActivity({
      action: "helper_created",
      entityType: "helper",
      entityId: data.id,
      description: `Created helper ${data.name} (${data.helper_id})`,
    });
  }
  redirectWithMessage(redirectTo, "success", "Helper created successfully.");
}

export async function updateHelperAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  await requireActionRole("helpers");
  const id = String(formData.get("id") ?? "");
  const redirectTo = getRedirectTo(formData, "/helpers");
  const name = String(formData.get("name") ?? "");

  const { error } = await supabase!
    .from("helpers")
    .update({
      helper_id: String(formData.get("helper_id") ?? ""),
      name: String(formData.get("name") ?? ""),
      nationality: String(formData.get("nationality") ?? ""),
      type: String(formData.get("type") ?? ""),
      experience: String(formData.get("experience") ?? ""),
      skills: String(formData.get("skills") ?? ""),
      salary: parseNumber(formData.get("salary")),
      status: String(formData.get("status") ?? "Available"),
    })
    .eq("id", id);

  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  await logActivity({
    action: "helper_updated",
    entityType: "helper",
    entityId: id,
    description: `Updated helper ${name}`,
  });
  redirectWithMessage("/helpers", "success", "Helper updated successfully.");
}

export async function deleteHelperAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  await requireActionRole("helpers");
  const id = String(formData.get("id") ?? "");
  const redirectTo = getRedirectTo(formData, "/helpers");
  const helperName = String(formData.get("helper_name") ?? "helper");

  const { error } = await supabase!.from("helpers").delete().eq("id", id);
  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  await logActivity({
    action: "helper_deleted",
    entityType: "helper",
    entityId: id,
    description: `Deleted helper ${helperName}`,
  });
  redirectWithMessage("/helpers", "success", "Helper deleted successfully.");
}

export async function createDealAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  await requireActionRole("sales");
  const redirectTo = getRedirectTo(formData, "/sales");

  const employerId = String(formData.get("employer_id") ?? "");
  const employerName = String(formData.get("employer_name") ?? "");

  let resolvedEmployerId = employerId;

  if (!resolvedEmployerId && employerName) {
    const { data, error } = await supabase!
      .from("employers")
      .insert({
        employer_name: employerName,
        country: String(formData.get("country") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        notes: String(formData.get("employer_notes") ?? ""),
      })
      .select("id")
      .single();

    if (error) {
      redirectWithMessage(redirectTo, "error", error.message);
    }
    resolvedEmployerId = data?.id ?? "";
  }

  if (!resolvedEmployerId) {
    redirectWithMessage(redirectTo, "error", "Employer information is required.");
  }

  const { data, error } = await supabase!.from("deals").insert({
    employer_id: resolvedEmployerId,
    helper_id: String(formData.get("helper_id") ?? ""),
    sales_stage: String(formData.get("sales_stage") ?? "New Lead"),
    sales_staff: String(formData.get("sales_staff") ?? ""),
    expected_amount: parseNumber(formData.get("expected_amount")),
    notes: String(formData.get("notes") ?? ""),
  }).select("id,sales_stage").single();

  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  if (data) {
    await logActivity({
      action: "sales_lead_created",
      entityType: "deal",
      entityId: data.id,
      description: `Created sales lead at stage ${data.sales_stage}`,
    });
  }
  redirectWithMessage("/sales", "success", "Sales lead created successfully.");
}

export async function updateDealAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  await requireActionRole("sales");
  const id = String(formData.get("id") ?? "");
  const redirectTo = getRedirectTo(formData, "/sales");
  const stage = String(formData.get("sales_stage") ?? "New Lead");

  const { error } = await supabase!
    .from("deals")
    .update({
      employer_id: String(formData.get("employer_id") ?? ""),
      helper_id: String(formData.get("helper_id") ?? ""),
      sales_stage: stage,
      sales_staff: String(formData.get("sales_staff") ?? ""),
      expected_amount: parseNumber(formData.get("expected_amount")),
      notes: String(formData.get("notes") ?? ""),
    })
    .eq("id", id);

  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  await logActivity({
    action: "deal_stage_updated",
    entityType: "deal",
    entityId: id,
    description: `Updated sales deal stage to ${stage}`,
  });
  redirectWithMessage("/sales", "success", "Sales lead updated successfully.");
}

export async function deleteDealAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  await requireActionRole("sales");
  const id = String(formData.get("id") ?? "");
  const redirectTo = getRedirectTo(formData, "/sales");
  const employerName = String(formData.get("employer_name") ?? "lead");

  const { error } = await supabase!.from("deals").delete().eq("id", id);
  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  await logActivity({
    action: "sales_lead_deleted",
    entityType: "deal",
    entityId: id,
    description: `Deleted sales lead for ${employerName}`,
  });
  redirectWithMessage("/sales", "success", "Sales lead deleted successfully.");
}

export async function createDocumentationAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  await requireActionRole("documentation");
  const redirectTo = getRedirectTo(formData, "/documentation");
  const stage = String(formData.get("stage") ?? "");
  const status = String(formData.get("status") ?? "");

  const { data, error } = await supabase!.from("documentation_cases").insert({
    deal_id: String(formData.get("deal_id") ?? ""),
    stage,
    assigned_staff: String(formData.get("assigned_staff") ?? ""),
    status,
    remarks: String(formData.get("remarks") ?? ""),
  }).select("id").single();

  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  if (data) {
    await logActivity({
      action: "documentation_created",
      entityType: "documentation_case",
      entityId: data.id,
      description: `Created documentation stage ${stage} with status ${status}`,
    });
  }
  redirectWithMessage(
    "/documentation",
    "success",
    "Documentation case created successfully.",
  );
}

export async function updateDocumentationAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  await requireActionRole("documentation");
  const id = String(formData.get("id") ?? "");
  const redirectTo = getRedirectTo(formData, "/documentation");
  const stage = String(formData.get("stage") ?? "");
  const status = String(formData.get("status") ?? "");

  const { error } = await supabase!
    .from("documentation_cases")
    .update({
      deal_id: String(formData.get("deal_id") ?? ""),
      stage,
      assigned_staff: String(formData.get("assigned_staff") ?? ""),
      status,
      remarks: String(formData.get("remarks") ?? ""),
    })
    .eq("id", id);

  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  await logActivity({
    action: "documentation_updated",
    entityType: "documentation_case",
    entityId: id,
    description: `Updated documentation stage ${stage} to status ${status}`,
  });
  redirectWithMessage(
    "/documentation",
    "success",
    "Documentation case updated successfully.",
  );
}

export async function deleteDocumentationAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  await requireActionRole("documentation");
  const id = String(formData.get("id") ?? "");
  const redirectTo = getRedirectTo(formData, "/documentation");
  const stage = String(formData.get("stage_name") ?? "documentation");

  const { error } = await supabase!
    .from("documentation_cases")
    .delete()
    .eq("id", id);

  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  await logActivity({
    action: "documentation_deleted",
    entityType: "documentation_case",
    entityId: id,
    description: `Deleted documentation stage ${stage}`,
  });
  redirectWithMessage(
    "/documentation",
    "success",
    "Documentation case deleted successfully.",
  );
}

export async function createFinanceAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  await requireActionRole("finance");
  const redirectTo = getRedirectTo(formData, "/finance");

  const amountReceived = parseNumber(formData.get("amount_received"));
  const supplierPayment = parseNumber(formData.get("supplier_payment"));
  const officeExpense = parseNumber(formData.get("office_expense"));

  const { data, error } = await supabase!.from("finance").insert({
    deal_id: String(formData.get("deal_id") ?? ""),
    amount_received: amountReceived,
    supplier_payment: supplierPayment,
    office_expense: officeExpense,
    profit: amountReceived - supplierPayment - officeExpense,
  }).select("id,profit").single();

  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  if (data) {
    await logActivity({
      action: "finance_created",
      entityType: "finance",
      entityId: data.id,
      description: `Created finance record with profit ${data.profit}`,
    });
  }
  redirectWithMessage("/finance", "success", "Finance record created successfully.");
}

export async function updateFinanceAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  await requireActionRole("finance");
  const id = String(formData.get("id") ?? "");
  const redirectTo = getRedirectTo(formData, "/finance");

  const amountReceived = parseNumber(formData.get("amount_received"));
  const supplierPayment = parseNumber(formData.get("supplier_payment"));
  const officeExpense = parseNumber(formData.get("office_expense"));
  const profit = amountReceived - supplierPayment - officeExpense;

  const { error } = await supabase!
    .from("finance")
    .update({
      deal_id: String(formData.get("deal_id") ?? ""),
      amount_received: amountReceived,
      supplier_payment: supplierPayment,
      office_expense: officeExpense,
      profit,
    })
    .eq("id", id);

  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  await logActivity({
    action: "finance_updated",
    entityType: "finance",
    entityId: id,
    description: `Updated finance record with profit ${profit}`,
  });
  redirectWithMessage("/finance", "success", "Finance record updated successfully.");
}

export async function deleteFinanceAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  await requireActionRole("finance");
  const id = String(formData.get("id") ?? "");
  const redirectTo = getRedirectTo(formData, "/finance");

  const { error } = await supabase!.from("finance").delete().eq("id", id);
  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  await logActivity({
    action: "finance_deleted",
    entityType: "finance",
    entityId: id,
    description: "Deleted finance record",
  });
  redirectWithMessage("/finance", "success", "Finance record deleted successfully.");
}
