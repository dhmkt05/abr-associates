import type { AppRole } from "@/lib/types";

export const ACCESS_NOT_CONFIGURED_ERROR = "Access not configured for this account.";

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

const emailRoleMap: Record<string, AppRole> = {
  "abrkannan11@gmail.com": "admin",
  "emeraldangelah@gmail.com": "helper_team",
  "utabdulrahmanin@gmail.com": "sales_team",
  "florajasmin07@gmail.com": "sales_team",
  "abrlogeshm@gmail.com": "documentation_team",
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

export function normalizeEmail(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

export function getRoleForEmail(email: string | null | undefined): AppRole | null {
  return emailRoleMap[normalizeEmail(email)] ?? null;
}

export function canRoleAccessPage(role: AppRole, page: ProtectedPage) {
  return rolePageAccess[role].includes(page);
}

export function getLandingPathForRole(role: AppRole) {
  return roleLandingPage[role];
}
