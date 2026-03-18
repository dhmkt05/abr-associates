import type { ReactNode } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";

type DetailField = {
  label: string;
  value: ReactNode;
};

export function RecordDetailsDialog({
  title,
  subtitle,
  closeHref,
  fields,
}: {
  title: string;
  subtitle?: string;
  closeHref: string;
  fields: DetailField[];
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <Card className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto p-0">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[var(--color-border)] bg-white/95 px-5 py-4 backdrop-blur md:px-6">
          <div>
            <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          <Link href={closeHref} className={buttonClassName("ghost")} aria-label="Close details">
            <X className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 px-5 py-5 md:grid-cols-2 md:px-6">
          {fields.map((field) => (
            <div key={field.label} className="rounded-2xl bg-[var(--color-surface-muted)] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{field.label}</p>
              <div className="mt-2 break-words text-sm font-medium text-slate-900">{field.value}</div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 border-t border-[var(--color-border)] bg-white/95 px-5 py-4 backdrop-blur md:px-6">
          <div className="flex justify-end">
            <Link href={closeHref} className={buttonClassName("secondary")}>
              Close
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
