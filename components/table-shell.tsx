import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function TableShell({
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
    <Card>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <div className="w-full lg:w-auto">{actions}</div>
      </div>
      <div className="mt-5 overflow-x-auto rounded-2xl">{children}</div>
    </Card>
  );
}
