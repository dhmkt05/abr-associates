import { Card } from "@/components/ui/card";

export function DemoBanner() {
  return (
    <Card className="border-dashed bg-[rgba(255,255,255,0.72)]">
      <p className="font-semibold text-slate-900">Demo mode is active.</p>
      <p className="mt-2 text-sm text-slate-600">
        Supabase environment variables are not configured yet, so the dashboard is showing sample data and write actions stay disabled until setup is complete.
      </p>
    </Card>
  );
}
