"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logActivity } from "@/lib/activity";
import { getCurrentUserProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
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

function getRequiredId(formData: FormData, field: string) {
  return String(formData.get(field) ?? "").trim();
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

async function requireAuthenticatedUser() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login");
  }

  return profile;
}

async function ensureDocumentationCaseForDeal(
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>,
  dealId: string,
) {
  const { data: existing } = await supabase
    .from("documentation_cases")
    .select("id")
    .eq("deal_id", dealId)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return existing.id as string;
  }

  const { data, error } = await supabase
    .from("documentation_cases")
    .insert({
      deal_id: dealId,
      current_process: "applying IPA",
      upfront_payment_status: "prospect",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id as string;
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
  await requireAuthenticatedUser();
  const redirectTo = getRedirectTo(formData, "/helpers");

  const country = String(formData.get("country") ?? "");

  const { data, error } = await supabase!
    .from("helpers")
    .insert({
      helper_id: String(formData.get("helper_id") ?? ""),
      name: String(formData.get("name") ?? ""),
      country,
      type: String(formData.get("type") ?? "other"),
      added_by: String(formData.get("added_by") ?? "Admin"),
      status: String(formData.get("status") ?? "active"),
    })
    .select("id,name,helper_id")
    .single();

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
  redirectWithMessage(redirectTo, "success", "Helper saved successfully.");
}

export async function updateHelperAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  await requireAuthenticatedUser();
  const redirectTo = getRedirectTo(formData, "/helpers");
  const id = getRequiredId(formData, "id");

  if (!id) {
    redirectWithMessage(redirectTo, "error", "Helper update failed because the record id is missing.");
  }

  const name = String(formData.get("name") ?? "");
  const country = String(formData.get("country") ?? "");

  const { error } = await supabase!
    .from("helpers")
    .update({
      helper_id: String(formData.get("helper_id") ?? ""),
      name,
      country,
      type: String(formData.get("type") ?? "other"),
      added_by: String(formData.get("added_by") ?? "Admin"),
      status: String(formData.get("status") ?? "active"),
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
  redirectWithMessage(redirectTo, "success", "Helper updated successfully.");
}

export async function deleteHelperAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  await requireAuthenticatedUser();
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
  redirectWithMessage(redirectTo, "success", "Helper deleted successfully.");
}

export async function createDealAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  await requireAuthenticatedUser();
  const redirectTo = getRedirectTo(formData, "/sales");

  const employerExternalId = String(formData.get("employer_id") ?? "");
  const employerName = String(formData.get("employer_name") ?? "");
  const employerNumber = String(formData.get("employer_number") ?? "");
  const handledBy = String(formData.get("handled_by") ?? "Admin");
  const status = String(formData.get("status") ?? "prospect");

  const { data: employer, error: employerError } = await supabase!
      .from("employers")
      .insert({
      employer_id: employerExternalId,
      employer_name: employerName,
      employer_number: employerNumber,
      handled_by: handledBy,
      status,
    })
    .select("id")
    .single();

  if (employerError || !employer) {
    redirectWithMessage(redirectTo, "error", employerError?.message ?? "Employer could not be saved.");
  }

  if (!employer) {
    throw new Error("Employer could not be saved.");
  }

  const resolvedEmployer = employer;

  const { data, error } = await supabase!
    .from("deals")
    .insert({
      employer_id: resolvedEmployer.id,
      helper_id: null,
      handled_by: handledBy,
      status,
    })
    .select("id,status")
    .single();

  revalidateDashboardRoutes();
  if (error || !data) {
    redirectWithMessage(redirectTo, "error", error?.message ?? "Sales entry could not be saved.");
  }
  if (!data) {
    throw new Error("Sales entry could not be saved.");
  }
  if (status === "deal closed") {
    await ensureDocumentationCaseForDeal(supabase!, data.id as string);
  }
  await logActivity({
    action: "sales_lead_created",
    entityType: "deal",
    entityId: data.id,
    description: `Created sales lead for ${employerName} with status ${status}`,
  });
  redirectWithMessage(redirectTo, "success", "Sales entry saved successfully.");
}

export async function updateDealAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  await requireAuthenticatedUser();
  const redirectTo = getRedirectTo(formData, "/sales");
  const id = getRequiredId(formData, "id");
  const employerRecordId = getRequiredId(formData, "employer_record_id");

  if (!id || !employerRecordId) {
    redirectWithMessage(
      redirectTo,
      "error",
      "Sales update failed because the existing record reference is missing.",
    );
  }

  const status = String(formData.get("status") ?? "prospect");
  const handledBy = String(formData.get("handled_by") ?? "Admin");
  const employerName = String(formData.get("employer_name") ?? "");

  const { error: employerError } = await supabase!
    .from("employers")
    .update({
      employer_id: String(formData.get("employer_id") ?? ""),
      employer_name: employerName,
      employer_number: String(formData.get("employer_number") ?? ""),
      handled_by: handledBy,
      status,
    })
    .eq("id", employerRecordId);

  if (employerError) {
    redirectWithMessage(redirectTo, "error", employerError.message);
  }

  const { error } = await supabase!
    .from("deals")
    .update({
      handled_by: handledBy,
      status,
    })
    .eq("id", id);

  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  if (status === "deal closed") {
    await ensureDocumentationCaseForDeal(supabase!, id);
  }
  await logActivity({
    action: "deal_stage_updated",
    entityType: "deal",
    entityId: id,
    description: `Updated ${employerName} to ${status}`,
  });
  redirectWithMessage(redirectTo, "success", "Sales entry updated successfully.");
}

export async function deleteDealAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  await requireAuthenticatedUser();
  const id = String(formData.get("id") ?? "");
  const redirectTo = getRedirectTo(formData, "/sales");
  const employerRecordId = String(formData.get("employer_record_id") ?? "");
  const employerName = String(formData.get("employer_name") ?? "lead");

  const { error } = await supabase!.from("deals").delete().eq("id", id);

  if (!error && employerRecordId) {
    await supabase!.from("employers").delete().eq("id", employerRecordId);
  }

  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  await logActivity({
    action: "sales_lead_deleted",
    entityType: "deal",
    entityId: id,
    description: `Deleted sales entry for ${employerName}`,
  });
  redirectWithMessage(redirectTo, "success", "Sales entry deleted successfully.");
}

export async function createDocumentationAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  await requireAuthenticatedUser();
  const redirectTo = getRedirectTo(formData, "/documentation");
  const currentProcess = String(formData.get("current_process") ?? "applying IPA");
  const upfrontPaymentStatus = String(formData.get("upfront_payment_status") ?? "prospect");

  const { data, error } = await supabase!
    .from("documentation_cases")
    .insert({
      deal_id: String(formData.get("deal_id") ?? ""),
      current_process: currentProcess,
      upfront_payment_status: upfrontPaymentStatus,
    })
    .select("id")
    .single();

  revalidateDashboardRoutes();
  if (error || !data) {
    redirectWithMessage(redirectTo, "error", error?.message ?? "Documentation record could not be saved.");
  }
  if (!data) {
    throw new Error("Documentation record could not be saved.");
  }
  await logActivity({
    action: "documentation_created",
    entityType: "documentation_case",
    entityId: data.id,
    description: `Created documentation record at ${currentProcess}`,
  });
  redirectWithMessage(redirectTo, "success", "Documentation record saved successfully.");
}

export async function updateDocumentationAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  await requireAuthenticatedUser();
  const redirectTo = getRedirectTo(formData, "/documentation");
  const id = getRequiredId(formData, "id");

  if (!id) {
    redirectWithMessage(
      redirectTo,
      "error",
      "Documentation update failed because the record id is missing.",
    );
  }

  const currentProcess = String(formData.get("current_process") ?? "applying IPA");
  const upfrontPaymentStatus = String(formData.get("upfront_payment_status") ?? "prospect");

  const { error } = await supabase!
    .from("documentation_cases")
    .update({
      deal_id: String(formData.get("deal_id") ?? ""),
      current_process: currentProcess,
      upfront_payment_status: upfrontPaymentStatus,
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
    description: `Updated documentation to ${currentProcess} / ${upfrontPaymentStatus}`,
  });
  redirectWithMessage(redirectTo, "success", "Documentation record updated successfully.");
}

export async function deleteDocumentationAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  await requireAuthenticatedUser();
  const id = String(formData.get("id") ?? "");
  const redirectTo = getRedirectTo(formData, "/documentation");

  const { error } = await supabase!.from("documentation_cases").delete().eq("id", id);

  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  await logActivity({
    action: "documentation_deleted",
    entityType: "documentation_case",
    entityId: id,
    description: "Deleted documentation record",
  });
  redirectWithMessage(redirectTo, "success", "Documentation record deleted successfully.");
}

export async function createFinanceAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  await requireAuthenticatedUser();
  const redirectTo = getRedirectTo(formData, "/finance");

  const amountReceived = parseNumber(formData.get("amount_received"));
  const supplierPayment = parseNumber(formData.get("supplier_payment"));
  const officeExpense = parseNumber(formData.get("office_expense"));
  const salary = parseNumber(formData.get("salary"));
  const reference = String(formData.get("reference") ?? "").trim();
  const profit = amountReceived - supplierPayment - officeExpense - salary;

  const { data, error } = await supabase!
    .from("finance")
    .insert({
      deal_id: String(formData.get("deal_id") ?? "") || null,
      reference,
      amount_received: amountReceived,
      supplier_payment: supplierPayment,
      office_expense: officeExpense,
      salary,
      profit,
    })
    .select("id,profit")
    .single();

  revalidateDashboardRoutes();
  if (error || !data) {
    redirectWithMessage(redirectTo, "error", error?.message ?? "Finance record could not be saved.");
  }
  if (!data) {
    throw new Error("Finance record could not be saved.");
  }
  await logActivity({
    action: "finance_created",
    entityType: "finance",
    entityId: data.id,
    description: `Created finance record for ${reference || "linked deal"} with profit ${data.profit}`,
  });
  redirectWithMessage(redirectTo, "success", "Finance entry saved successfully.");
}

export async function updateFinanceAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  await requireAuthenticatedUser();
  const redirectTo = getRedirectTo(formData, "/finance");
  const id = getRequiredId(formData, "id");

  if (!id) {
    redirectWithMessage(redirectTo, "error", "Finance update failed because the record id is missing.");
  }

  const amountReceived = parseNumber(formData.get("amount_received"));
  const supplierPayment = parseNumber(formData.get("supplier_payment"));
  const officeExpense = parseNumber(formData.get("office_expense"));
  const salary = parseNumber(formData.get("salary"));
  const reference = String(formData.get("reference") ?? "").trim();
  const profit = amountReceived - supplierPayment - officeExpense - salary;

  const { error } = await supabase!
    .from("finance")
    .update({
      deal_id: String(formData.get("deal_id") ?? "") || null,
      reference,
      amount_received: amountReceived,
      supplier_payment: supplierPayment,
      office_expense: officeExpense,
      salary,
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
    description: `Updated finance record for ${reference || "linked deal"} with profit ${profit}`,
  });
  redirectWithMessage(redirectTo, "success", "Finance entry updated successfully.");
}

export async function deleteFinanceAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  await requireAuthenticatedUser();
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
  redirectWithMessage(redirectTo, "success", "Finance entry deleted successfully.");
}
