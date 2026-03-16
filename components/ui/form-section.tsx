import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="max-w-5xl">
      <div className="border-b border-[var(--color-border)] pb-4">
        <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>
      <div className="pt-5">{children}</div>
    </Card>
  );
}
