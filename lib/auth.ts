import { redirect } from "next/navigation";
import { buildRedirectUrl } from "@/lib/utils";
import {
  canRoleAccessPage,
  getLandingPathForRole,
  MISSING_ROLE_PROFILE_ERROR,
  normalizeAppRole,
  type ProtectedPage,
} from "@/lib/access-control";
import { getCurrentUser } from "@/lib/supabase/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole, Profile } from "@/lib/types";

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  const supabase = await getSupabaseServerClient();

  if (!user || !supabase) {
    return null;
  }

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,created_at")
    .eq("id", user.id)
    .maybeSingle();

  const role = normalizeAppRole(String(profileRow?.role ?? ""));

  if (!profileRow || !role) {
    return null;
  }

  return {
    id: String(profileRow.id),
    email: String(profileRow.email ?? user.email ?? ""),
    full_name:
      String(profileRow.full_name ?? "").trim() ||
      (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
      user.email?.split("@")[0] ||
      "User",
    role,
    created_at: String(profileRow.created_at ?? new Date().toISOString()),
  };
}

export async function requireAuthenticatedProfile() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect(
      buildRedirectUrl("/login", {
        error: MISSING_ROLE_PROFILE_ERROR,
      }),
    );
  }

  return {
    user,
    profile,
  };
}

export async function requirePageAccess(page: ProtectedPage) {
  const { user, profile } = await requireAuthenticatedProfile();

  if (!canRoleAccessPage(profile.role, page)) {
    redirect(getLandingPathForRole(profile.role));
  }

  return {
    user,
    profile,
  };
}

export async function getLoginRedirectPath() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return buildRedirectUrl("/login", {
      error: MISSING_ROLE_PROFILE_ERROR,
    });
  }

  return getLandingPathForRole(profile.role);
}

export function getRoleLabel(role: AppRole) {
  if (role === "admin") return "Admin";
  if (role === "helper_team") return "Helper Team";
  if (role === "sales_team") return "Sales Team";
  return "Documentation Team";
}
