import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function DataTable({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </div>
        {actions ? <div className="w-full lg:w-auto">{actions}</div> : null}
      </div>
      <div className="mt-5 overflow-x-auto">{children}</div>
    </Card>
  );
}
