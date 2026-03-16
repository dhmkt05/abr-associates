import { Badge } from "@/components/ui/badge";

const statusToneMap: Record<string, "neutral" | "success" | "warning" | "danger" | "accent"> = {
  Available: "success",
  Reserved: "warning",
  Placed: "accent",
  Inactive: "neutral",
  Active: "success",
  "New Lead": "accent",
  Interview: "warning",
  Negotiation: "warning",
  Confirmed: "success",
  Contract: "accent",
  "Work Permit": "accent",
  Visa: "accent",
  Travel: "warning",
  Arrival: "success",
  "First Month Payment": "success",
  Completed: "success",
  Pending: "warning",
  Submitted: "accent",
  helper: "accent",
  deal: "warning",
  documentation: "neutral",
  finance: "success",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={statusToneMap[status] ?? "neutral"}>{status}</Badge>;
}
