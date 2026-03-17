export type ProtectedPage =
  | "dashboard"
  | "helpers"
  | "sales"
  | "documentation"
  | "finance"
  | "reports"
  | "settings"
  | "access-denied";

export const roleLandingPath = {
  admin: "/dashboard",
  data_team: "/dashboard",
  sales_team: "/dashboard",
  documentation_team: "/dashboard",
} as const;

export function canAccessPage(role?: string, page?: ProtectedPage) {
  void role;
  void page;
  return true;
}

export function canManageHelpers(role?: string) {
  void role;
  return true;
}

export function canManageSales(role?: string) {
  void role;
  return true;
}

export function canManageDocumentation(role?: string) {
  void role;
  return true;
}

export function canManageFinance(role?: string) {
  void role;
  return true;
}
