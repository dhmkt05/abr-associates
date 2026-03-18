import type { AppRole } from "@/lib/types";

export const MISSING_ROLE_PROFILE_ERROR = "No matching role profile was found.";

export type ProtectedPage =
  | "dashboard"
  | "helpers"
  | "sales"
  | "documentation"
  | "finance"
  | "reports"
  | "settings";

export const rolePageAccess: Record<AppRole, ProtectedPage[]> = {
  admin: [
    "dashboard",
    "helpers",
    "sales",
    "documentation",
    "finance",
    "reports",
    "settings",
  ],
  helper_team: ["helpers"],
  sales_team: ["sales"],
  documentation_team: ["helpers", "documentation"],
};

export const roleLandingPage: Record<AppRole, string> = {
  admin: "/dashboard",
  helper_team: "/helpers",
  sales_team: "/sales",
  documentation_team: "/documentation",
};

export function normalizeAppRole(value: string | null | undefined): AppRole | null {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (
    normalized === "admin" ||
    normalized === "helper_team" ||
    normalized === "sales_team" ||
    normalized === "documentation_team"
  ) {
    return normalized;
  }

  return null;
}

export function canRoleAccessPage(role: AppRole, page: ProtectedPage) {
  return rolePageAccess[role].includes(page);
}

export function getLandingPathForRole(role: AppRole) {
  return roleLandingPage[role];
}
