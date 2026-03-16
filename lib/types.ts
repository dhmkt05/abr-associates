export type AppRole = "admin" | "data_team" | "sales_team" | "documentation_team";
export type HelperStatus = "Available" | "Reserved" | "Placed" | "Inactive";
export type SalesStage = "New Lead" | "Interview" | "Negotiation" | "Confirmed";
export type DocumentationStage =
  | "Contract"
  | "Work Permit"
  | "IPA"
  | "Visa"
  | "Flight Ticket"
  | "Insurance"
  | "Travel"
  | "Arrival"
  | "First Month Payment";

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
  role: AppRole;
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
  nationality: string;
  type: string;
  experience: string;
  skills: string;
  salary: number;
  status: HelperStatus;
  created_at: string;
}

export interface Employer {
  id: string;
  employer_name: string;
  country: string;
  phone: string;
  notes: string;
  created_at: string;
}

export interface Deal {
  id: string;
  employer_id: string;
  helper_id: string;
  sales_stage: SalesStage;
  sales_staff: string;
  expected_amount: number;
  notes: string;
  created_at: string;
}

export interface DocumentationCase {
  id: string;
  deal_id: string;
  stage: DocumentationStage;
  assigned_staff: string;
  status: string;
  remarks: string;
  created_at: string;
}

export interface FinanceRecord {
  id: string;
  deal_id: string;
  amount_received: number;
  supplier_payment: number;
  office_expense: number;
  profit: number;
  created_at: string;
}

export interface SalesRow extends Deal {
  employer?: Employer;
  helper?: Helper;
}

export interface DocumentationRow extends DocumentationCase {
  deal?: SalesRow;
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
