import { redirect } from "next/navigation";
import { roleLandingPath, type ProtectedPage } from "@/lib/rbac";
import { getCurrentUser, getSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

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
    return {
      ...(data as Profile),
      role: "admin",
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
  void page;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile();

  return {
    user,
    profile,
  };
}

export async function getLoginRedirectPath() {
  return roleLandingPath.admin;
}
