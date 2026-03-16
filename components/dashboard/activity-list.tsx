import { Clock3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import type { ActivityItem } from "@/lib/types";

export function ActivityList({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">Recent activity</h3>
          <p className="mt-2 text-sm text-slate-500">
            Keep an eye on the latest manager-facing updates across every workflow.
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Clock3}
            title="No recent updates yet"
            description="Once helpers, deals, documentation, or finance records are created, the latest activity will appear here."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-slate-50/80 p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-slate-950">{item.title}</p>
                  <StatusBadge status={item.category} />
                </div>
                <p className="mt-1 text-sm text-slate-500">{item.description}</p>
              </div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                {formatDate(item.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
