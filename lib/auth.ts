import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export type ProtectedPage =
  | "dashboard"
  | "helpers"
  | "sales"
  | "documentation"
  | "finance"
  | "reports"
  | "settings";

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? "",
    full_name:
      (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
      user.email?.split("@")[0] ||
      "Admin",
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
  return "/dashboard";
}
