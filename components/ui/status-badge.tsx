import { Badge } from "@/components/ui/badge";

const statusToneMap: Record<string, "neutral" | "success" | "warning" | "danger" | "accent"> = {
  active: "success",
  inactive: "neutral",
  "follow up": "warning",
  prospect: "neutral",
  "interview going": "warning",
  negotiation: "accent",
  "deal closed": "success",
  "applying IPA": "accent",
  "work permit": "accent",
  "going to take flight": "warning",
  "flight ticket": "warning",
  insurance: "accent",
  "reach employer house": "success",
  "medical follow up": "warning",
  "payment done": "success",
  helper: "accent",
  deal: "warning",
  documentation: "neutral",
  finance: "success",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={statusToneMap[status] ?? "neutral"}>{status}</Badge>;
}
