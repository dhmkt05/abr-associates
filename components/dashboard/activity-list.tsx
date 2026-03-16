import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { ActivityItem } from "@/lib/types";

const tones = {
  helper: "accent",
  deal: "warning",
  documentation: "neutral",
  finance: "success",
} as const;

export function ActivityList({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Recent activity</h3>
          <p className="text-sm text-slate-500">
            Latest updates across recruitment, sales, documents, and finance.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-2 rounded-2xl border border-[var(--color-border)] bg-white/70 p-4 lg:flex-row lg:items-center lg:justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900">{item.title}</p>
                <Badge tone={tones[item.category]}>{item.category}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-600">{item.description}</p>
            </div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-400">
              {formatDate(item.created_at)}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
