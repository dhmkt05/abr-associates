import type {
  Deal,
  DocumentationCase,
  Employer,
  FinanceRecord,
  Helper,
} from "@/lib/types";

export const demoHelpers: Helper[] = [
  {
    id: "h1",
    helper_id: "ABR-H-101",
    name: "Maria Lopez",
    nationality: "Philippines",
    type: "Transfer",
    experience: "6 years",
    skills: "Infant care, cooking, elderly support",
    salary: 750,
    status: "Available",
    created_at: "2026-03-10T08:30:00.000Z",
  },
  {
    id: "h2",
    helper_id: "ABR-H-102",
    name: "Siti Rahmah",
    nationality: "Indonesia",
    type: "Ex-Singapore",
    experience: "4 years",
    skills: "General housekeeping, pets, cooking",
    salary: 680,
    status: "Reserved",
    created_at: "2026-03-11T11:00:00.000Z",
  },
  {
    id: "h3",
    helper_id: "ABR-H-103",
    name: "Asha Kumari",
    nationality: "India",
    type: "Fresh",
    experience: "2 years",
    skills: "Elderly care, Hindi cuisine",
    salary: 620,
    status: "Placed",
    created_at: "2026-03-12T13:15:00.000Z",
  },
];

export const demoEmployers: Employer[] = [
  {
    id: "e1",
    employer_name: "Tan Family",
    country: "Singapore",
    phone: "+65 8111 2200",
    notes: "Looking for infant care support.",
    created_at: "2026-03-09T09:30:00.000Z",
  },
  {
    id: "e2",
    employer_name: "Rahman Household",
    country: "Singapore",
    phone: "+65 8222 9988",
    notes: "Needs helper with elderly care experience.",
    created_at: "2026-03-10T10:15:00.000Z",
  },
  {
    id: "e3",
    employer_name: "Wong Residence",
    country: "Singapore",
    phone: "+65 8333 6677",
    notes: "Open to transfer helper only.",
    created_at: "2026-03-14T14:45:00.000Z",
  },
];

export const demoDeals: Deal[] = [
  {
    id: "d1",
    employer_id: "e1",
    helper_id: "h1",
    sales_stage: "Interview",
    sales_staff: "Nur Aisyah",
    expected_amount: 4200,
    notes: "Interview scheduled for Tuesday.",
    created_at: "2026-03-11T07:45:00.000Z",
  },
  {
    id: "d2",
    employer_id: "e2",
    helper_id: "h3",
    sales_stage: "Confirmed",
    sales_staff: "Daniel Lim",
    expected_amount: 5100,
    notes: "Deposit received and documents in progress.",
    created_at: "2026-03-12T09:20:00.000Z",
  },
  {
    id: "d3",
    employer_id: "e3",
    helper_id: "h2",
    sales_stage: "Negotiation",
    sales_staff: "Sara Ong",
    expected_amount: 4700,
    notes: "Waiting for salary confirmation.",
    created_at: "2026-03-15T12:00:00.000Z",
  },
];

export const demoDocumentationCases: DocumentationCase[] = [
  {
    id: "c1",
    deal_id: "d2",
    stage: "Work Permit",
    assigned_staff: "Priya",
    status: "Submitted",
    remarks: "Awaiting ministry acknowledgement.",
    created_at: "2026-03-13T08:10:00.000Z",
  },
  {
    id: "c2",
    deal_id: "d2",
    stage: "Travel",
    assigned_staff: "Amir",
    status: "Pending",
    remarks: "Ticket options requested.",
    created_at: "2026-03-14T09:00:00.000Z",
  },
];

export const demoFinance: FinanceRecord[] = [
  {
    id: "f1",
    deal_id: "d2",
    amount_received: 5100,
    supplier_payment: 2800,
    office_expense: 400,
    profit: 1900,
    created_at: "2026-03-14T16:30:00.000Z",
  },
];
