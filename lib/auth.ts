import { redirect } from "next/navigation";
import {
  canAccessPage,
  roleLandingPath,
  type ProtectedPage,
} from "@/lib/rbac";
import { getCurrentUser, getSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole, Profile } from "@/lib/types";

function normalizeRole(role: string | null | undefined): AppRole {
  return role === "data_team" ? "data_team" : "admin";
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
    return {
      ...profile,
      role: normalizeRole(profile.role),
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
