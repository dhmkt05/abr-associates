import { CheckCircle2, CircleAlert, DatabaseZap, ShieldCheck } from "lucide-react";
import { TopHeader } from "@/components/layout/top-header";
import { Card } from "@/components/ui/card";
import { isSupabaseConfigured } from "@/lib/env";

export default function SettingsPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="space-y-6">
      <TopHeader
        title="Settings"
        subtitle="Review deployment readiness, environment variables, and admin access requirements."
        showSignOut={configured}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Environment setup</h3>
          <div className="mt-5 space-y-4">
            {[
              {
                label: "NEXT_PUBLIC_SUPABASE_URL",
                ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
              },
              {
                label: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
                ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] p-4"
              >
                <div className="flex items-center gap-3">
                  {item.ok ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <CircleAlert className="h-5 w-5 text-amber-600" />
                  )}
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">
                  {item.ok ? "Configured" : "Missing"}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900">Deployment checklist</h3>
          <div className="mt-5 space-y-4 text-sm text-slate-600">
            <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] p-4">
              <DatabaseZap className="mt-0.5 h-5 w-5 text-[var(--color-primary)]" />
              <div>
                <p className="font-semibold text-slate-900">Supabase schema</p>
                <p>Run `supabase/schema.sql` then `supabase/seed.sql` if you want starter content.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-[var(--color-primary)]" />
              <div>
                <p className="font-semibold text-slate-900">Admin access</p>
                <p>Create the manager account in Supabase Auth, then use the login page to sign in.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-[var(--color-primary)]" />
              <div>
                <p className="font-semibold text-slate-900">Vercel ready</p>
                <p>Add the same environment variables in Vercel before deploying to production.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
