import type { AppRole } from "@/lib/types";

export type ProtectedPage =
  | "dashboard"
  | "helpers"
  | "sales"
  | "documentation"
  | "finance"
  | "reports"
  | "settings"
  | "access-denied";

export const roleLandingPath: Record<AppRole, string> = {
  admin: "/dashboard",
  data_team: "/helpers",
  sales_team: "/sales",
  documentation_team: "/documentation",
};

const pagePermissions: Record<ProtectedPage, AppRole[]> = {
  dashboard: ["admin"],
  helpers: ["admin", "data_team", "sales_team"],
  sales: ["admin", "sales_team"],
  documentation: ["admin", "documentation_team"],
  finance: ["admin"],
  reports: ["admin"],
  settings: ["admin"],
  "access-denied": ["admin", "data_team", "sales_team", "documentation_team"],
};

export function canAccessPage(role: AppRole, page: ProtectedPage) {
  return pagePermissions[page].includes(role);
}

export function canManageHelpers(role: AppRole) {
  return role === "admin" || role === "data_team";
}

export function canManageSales(role: AppRole) {
  return role === "admin" || role === "sales_team";
}

export function canManageDocumentation(role: AppRole) {
  return role === "admin" || role === "documentation_team";
}

export function canManageFinance(role: AppRole) {
  return role === "admin";
}
