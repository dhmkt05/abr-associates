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
  sales_team: "/dashboard",
  documentation_team: "/dashboard",
};

const pagePermissions: Record<ProtectedPage, AppRole[]> = {
  dashboard: ["admin"],
  helpers: ["admin", "data_team"],
  sales: ["admin"],
  documentation: ["admin"],
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
  return role === "admin";
}

export function canManageDocumentation(role: AppRole) {
  return role === "admin";
}

export function canManageFinance(role: AppRole) {
  return role === "admin";
}
