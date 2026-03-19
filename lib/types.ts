export type AppRole = "admin" | "helper_team" | "sales_team" | "documentation_team";
export type HelperStatus = string;
export type HelperCountry = "Myanmar" | "India" | "Indonesia" | "Other";
export type HelperType = "Ex-Singapore" | "New" | "Transfer";
export type SalesStatus =
  | "prospect"
  | "interview going"
  | "negotiation"
  | "deal closed"
  | "deal cancelled";
export type DocumentationProcess =
  | "applying IPA"
  | "work permit"
  | "going to take flight"
  | "flight ticket"
  | "insurance"
  | "reach employer house"
  | "medical follow up";
export type UpfrontPaymentStatus = "prospect" | "payment done";
export type DocumentationWorkflowState = "active" | "inactive" | "cancelled";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_email: string;
  role: string;
  action: string;
  entity_type: string;
  entity_id: string;
  description: string;
  created_at: string;
}

export interface Helper {
  id: string;
  helper_id: string;
  name: string;
  country: HelperCountry;
  type: HelperType;
  added_by: string;
  status: HelperStatus;
  created_at: string;
}

export interface Employer {
  id: string;
  employer_id: string;
  employer_name: string;
  employer_number: string;
  handled_by: string;
  status: SalesStatus;
  created_at: string;
}

export interface Deal {
  id: string;
  employer_id: string;
  helper_id: string | null;
  handled_by: string;
  status: SalesStatus;
  notes: string;
  created_at: string;
}

export interface DocumentationCase {
  id: string;
  deal_id: string;
  assigned_staff: string;
  current_process: DocumentationProcess;
  upfront_payment_status: UpfrontPaymentStatus;
  created_at: string;
}

export interface FinanceRecord {
  id: string;
  deal_id: string | null;
  reference: string;
  amount_received: number;
  supplier_payment: number;
  office_expense: number;
  salary: number;
  profit: number;
  created_at: string;
}

export interface SalesRow extends Deal {
  employer?: Employer;
  helper?: Helper | null;
}

export interface DocumentationRow extends DocumentationCase {
  deal?: SalesRow;
  workflow_state: DocumentationWorkflowState;
}

export interface FinanceRow extends FinanceRecord {
  deal?: SalesRow;
}

export interface DashboardMetrics {
  totalHelpers: number;
  activeLeads: number;
  dealsConfirmed: number;
  documentationCases: number;
  revenue: number;
  profit: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  created_at: string;
  category: "helper" | "deal" | "documentation" | "finance";
}
