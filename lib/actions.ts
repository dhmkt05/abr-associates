"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

export async function loginAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase!.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
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
  const redirectTo = getRedirectTo(formData, "/helpers");

  const { error } = await supabase!.from("helpers").insert({
    helper_id: String(formData.get("helper_id") ?? ""),
    name: String(formData.get("name") ?? ""),
    nationality: String(formData.get("nationality") ?? ""),
    type: String(formData.get("type") ?? ""),
    experience: String(formData.get("experience") ?? ""),
    skills: String(formData.get("skills") ?? ""),
    salary: parseNumber(formData.get("salary")),
    status: String(formData.get("status") ?? "Available"),
  });

  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  redirectWithMessage(redirectTo, "success", "Helper created successfully.");
}

export async function updateHelperAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  const id = String(formData.get("id") ?? "");
  const redirectTo = getRedirectTo(formData, "/helpers");

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
  redirectWithMessage("/helpers", "success", "Helper updated successfully.");
}

export async function deleteHelperAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  const id = String(formData.get("id") ?? "");
  const redirectTo = getRedirectTo(formData, "/helpers");

  const { error } = await supabase!.from("helpers").delete().eq("id", id);
  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  redirectWithMessage("/helpers", "success", "Helper deleted successfully.");
}

export async function createDealAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
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

  const { error } = await supabase!.from("deals").insert({
    employer_id: resolvedEmployerId,
    helper_id: String(formData.get("helper_id") ?? ""),
    sales_stage: String(formData.get("sales_stage") ?? "New Lead"),
    sales_staff: String(formData.get("sales_staff") ?? ""),
    expected_amount: parseNumber(formData.get("expected_amount")),
    notes: String(formData.get("notes") ?? ""),
  });

  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  redirectWithMessage("/sales", "success", "Sales lead created successfully.");
}

export async function updateDealAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  const id = String(formData.get("id") ?? "");
  const redirectTo = getRedirectTo(formData, "/sales");

  const { error } = await supabase!
    .from("deals")
    .update({
      employer_id: String(formData.get("employer_id") ?? ""),
      helper_id: String(formData.get("helper_id") ?? ""),
      sales_stage: String(formData.get("sales_stage") ?? "New Lead"),
      sales_staff: String(formData.get("sales_staff") ?? ""),
      expected_amount: parseNumber(formData.get("expected_amount")),
      notes: String(formData.get("notes") ?? ""),
    })
    .eq("id", id);

  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  redirectWithMessage("/sales", "success", "Sales lead updated successfully.");
}

export async function deleteDealAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  const id = String(formData.get("id") ?? "");
  const redirectTo = getRedirectTo(formData, "/sales");

  const { error } = await supabase!.from("deals").delete().eq("id", id);
  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  redirectWithMessage("/sales", "success", "Sales lead deleted successfully.");
}

export async function createDocumentationAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  const redirectTo = getRedirectTo(formData, "/documentation");

  const { error } = await supabase!.from("documentation_cases").insert({
    deal_id: String(formData.get("deal_id") ?? ""),
    stage: String(formData.get("stage") ?? ""),
    assigned_staff: String(formData.get("assigned_staff") ?? ""),
    status: String(formData.get("status") ?? ""),
    remarks: String(formData.get("remarks") ?? ""),
  });

  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
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
  const id = String(formData.get("id") ?? "");
  const redirectTo = getRedirectTo(formData, "/documentation");

  const { error } = await supabase!
    .from("documentation_cases")
    .update({
      deal_id: String(formData.get("deal_id") ?? ""),
      stage: String(formData.get("stage") ?? ""),
      assigned_staff: String(formData.get("assigned_staff") ?? ""),
      status: String(formData.get("status") ?? ""),
      remarks: String(formData.get("remarks") ?? ""),
    })
    .eq("id", id);

  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  redirectWithMessage(
    "/documentation",
    "success",
    "Documentation case updated successfully.",
  );
}

export async function deleteDocumentationAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  const id = String(formData.get("id") ?? "");
  const redirectTo = getRedirectTo(formData, "/documentation");

  const { error } = await supabase!
    .from("documentation_cases")
    .delete()
    .eq("id", id);

  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  redirectWithMessage(
    "/documentation",
    "success",
    "Documentation case deleted successfully.",
  );
}

export async function createFinanceAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  const redirectTo = getRedirectTo(formData, "/finance");

  const amountReceived = parseNumber(formData.get("amount_received"));
  const supplierPayment = parseNumber(formData.get("supplier_payment"));
  const officeExpense = parseNumber(formData.get("office_expense"));

  const { error } = await supabase!.from("finance").insert({
    deal_id: String(formData.get("deal_id") ?? ""),
    amount_received: amountReceived,
    supplier_payment: supplierPayment,
    office_expense: officeExpense,
    profit: amountReceived - supplierPayment - officeExpense,
  });

  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  redirectWithMessage("/finance", "success", "Finance record created successfully.");
}

export async function updateFinanceAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  const id = String(formData.get("id") ?? "");
  const redirectTo = getRedirectTo(formData, "/finance");

  const amountReceived = parseNumber(formData.get("amount_received"));
  const supplierPayment = parseNumber(formData.get("supplier_payment"));
  const officeExpense = parseNumber(formData.get("office_expense"));

  const { error } = await supabase!
    .from("finance")
    .update({
      deal_id: String(formData.get("deal_id") ?? ""),
      amount_received: amountReceived,
      supplier_payment: supplierPayment,
      office_expense: officeExpense,
      profit: amountReceived - supplierPayment - officeExpense,
    })
    .eq("id", id);

  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  redirectWithMessage("/finance", "success", "Finance record updated successfully.");
}

export async function deleteFinanceAction(formData: FormData) {
  ensureConfigured();
  const supabase = await getSupabaseServerClient();
  const id = String(formData.get("id") ?? "");
  const redirectTo = getRedirectTo(formData, "/finance");

  const { error } = await supabase!.from("finance").delete().eq("id", id);
  revalidateDashboardRoutes();
  if (error) {
    redirectWithMessage(redirectTo, "error", error.message);
  }
  redirectWithMessage("/finance", "success", "Finance record deleted successfully.");
}
