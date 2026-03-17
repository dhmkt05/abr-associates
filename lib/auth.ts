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

  if (normalized === "admin") {
    return "admin";
  }

  if (normalized === "data_team") {
    return "data_team";
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
    console.log("[auth] no supabase client available", {
      authUserEmail: user.email ?? null,
      authUserId: user.id,
    });
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const rawRole = data ? String((data as Profile).role ?? "") : null;
  const resolvedRole = normalizeRole(rawRole);

  console.log("[auth] profile lookup", {
    authUserEmail: user.email ?? null,
    authUserId: user.id,
    fetchedProfileRole: rawRole,
    resolvedRole,
    hadProfileRow: Boolean(data),
    queryError: error?.message ?? null,
  });

  if (error || !data || !resolvedRole) {
    return null;
  }

  return {
    ...(data as Profile),
    role: resolvedRole,
  };
}

export async function requirePageAccess(page: ProtectedPage) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/login?error=No matching role profile was found.");
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

  if (!profile) {
    return null;
  }

  return roleLandingPath[profile.role];
}
