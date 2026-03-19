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
    country: "Myanmar",
    type: "Ex-Singapore",
    added_by: "Admin",
    status: "active",
    created_at: "2026-03-10T08:30:00.000Z",
  },
  {
    id: "h2",
    helper_id: "ABR-H-102",
    name: "Siti Rahmah",
    country: "Indonesia",
    type: "New",
    added_by: "Admin",
    status: "follow up",
    created_at: "2026-03-11T11:00:00.000Z",
  },
  {
    id: "h3",
    helper_id: "ABR-H-103",
    name: "Asha Kumari",
    country: "India",
    type: "Transfer",
    added_by: "Admin",
    status: "active",
    created_at: "2026-03-12T13:15:00.000Z",
  },
];

export const demoEmployers: Employer[] = [
  {
    id: "e1",
    employer_id: "EMP-001",
    employer_name: "Tan Family",
    employer_number: "+65 8111 2200",
    handled_by: "Admin",
    status: "interview going",
    created_at: "2026-03-09T09:30:00.000Z",
  },
  {
    id: "e2",
    employer_id: "EMP-002",
    employer_name: "Rahman Household",
    employer_number: "+65 8222 9988",
    handled_by: "Admin",
    status: "deal closed",
    created_at: "2026-03-10T10:15:00.000Z",
  },
  {
    id: "e3",
    employer_id: "EMP-003",
    employer_name: "Wong Residence",
    employer_number: "+65 8333 6677",
    handled_by: "Admin",
    status: "negotiation",
    created_at: "2026-03-14T14:45:00.000Z",
  },
];

export const demoDeals: Deal[] = [
  {
    id: "d1",
    employer_id: "e1",
    helper_id: null,
    handled_by: "Admin",
    status: "interview going",
    notes: "",
    expected_date: null,
    created_at: "2026-03-11T07:45:00.000Z",
  },
  {
    id: "d2",
    employer_id: "e2",
    helper_id: null,
    handled_by: "Admin",
    status: "deal closed",
    notes: "",
    expected_date: "2026-03-20",
    created_at: "2026-03-12T09:20:00.000Z",
  },
  {
    id: "d3",
    employer_id: "e3",
    helper_id: null,
    handled_by: "Admin",
    status: "negotiation",
    notes: "",
    expected_date: null,
    created_at: "2026-03-15T12:00:00.000Z",
  },
];

export const demoDocumentationCases: DocumentationCase[] = [
  {
    id: "c1",
    deal_id: "d2",
    assigned_staff: "Admin",
    current_process: "applying IPA",
    upfront_payment_status: "payment done",
    created_at: "2026-03-13T08:10:00.000Z",
  },
];

export const demoFinance: FinanceRecord[] = [
  {
    id: "f1",
    deal_id: "d2",
    reference: "Rahman Household",
    amount_received: 5100,
    supplier_payment: 2800,
    office_expense: 400,
    salary: 300,
    profit: 1600,
    created_at: "2026-03-14T16:30:00.000Z",
  },
];
