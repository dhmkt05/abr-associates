import { redirect } from "next/navigation";
import {
  canAccessPage,
  roleLandingPath,
  type ProtectedPage,
} from "@/lib/rbac";
import { getCurrentUser, getSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole, Profile } from "@/lib/types";

function normalizeRole(role: string | null | undefined): AppRole | null {
  const normalized = role?.trim().toLowerCase();

  if (normalized === "data_team") {
    return "data_team";
  }

  if (normalized === "admin") {
    return "admin";
  }

  return null;
}

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return {
      id: user.id,
      email: user.email ?? "",
      full_name: user.email?.split("@")[0] ?? "Admin",
      role: "admin",
      created_at: new Date().toISOString(),
    };
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (data) {
    const profile = data as Profile;
    const resolvedRole = normalizeRole(profile.role);

    if (!resolvedRole) {
      return null;
    }

    return {
      ...profile,
      role: resolvedRole,
    };
  }

  return {
    id: user.id,
    email: user.email ?? "",
    full_name: user.email?.split("@")[0] ?? "Admin",
    role: "admin",
    created_at: new Date().toISOString(),
  };
}

export async function requirePageAccess(page: ProtectedPage) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!canAccessPage(profile.role, page)) {
    redirect(roleLandingPath[profile.role]);
  }

  return {
    user,
    profile,
  };
}

export async function getLoginRedirectPath() {
  const profile = await getCurrentUserProfile();

  return profile ? roleLandingPath[profile.role] : roleLandingPath.admin;
}
