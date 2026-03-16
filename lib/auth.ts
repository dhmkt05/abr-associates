import { redirect } from "next/navigation";
import {
  canAccessPage,
  roleLandingPath,
  type ProtectedPage,
} from "@/lib/rbac";
import { getSession, getSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as Profile;
}

export async function requirePageAccess(page: ProtectedPage) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect("/access-denied?reason=missing-profile");
  }

  if (!canAccessPage(profile.role, page)) {
    redirect(`/access-denied?from=${page}`);
  }

  return {
    session,
    profile,
  };
}

export async function getLoginRedirectPath() {
  const profile = await getCurrentUserProfile();

  if (!profile) {
    return "/access-denied?reason=missing-profile";
  }

  return roleLandingPath[profile.role];
}
