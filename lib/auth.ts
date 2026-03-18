import { redirect } from "next/navigation";
import { buildRedirectUrl } from "@/lib/utils";
import {
  ACCESS_NOT_CONFIGURED_ERROR,
  canRoleAccessPage,
  getLandingPathForRole,
  getRoleForEmail,
  type ProtectedPage,
} from "@/lib/access-control";
import { getCurrentUser } from "@/lib/supabase/server";
import type { AppRole, Profile } from "@/lib/types";

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }
  const email = user.email ?? "";
  const role = getRoleForEmail(email);

  if (!role) {
    return null;
  }

  return {
    id: user.id,
    email,
    full_name:
      (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()) ||
      email.split("@")[0] ||
      "User",
    role,
    created_at: new Date().toISOString(),
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
        error: ACCESS_NOT_CONFIGURED_ERROR,
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
      error: ACCESS_NOT_CONFIGURED_ERROR,
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
