import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { isSupabaseConfigured } from "@/lib/env";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Login",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const configured = isSupabaseConfigured();

  if (configured) {
    const user = await getCurrentUser();
    if (user) {
      redirect("/auth/callback");
    }
  }

  const params = await searchParams;

  return (
    <main className="grid min-h-screen grid-cols-1 bg-[var(--color-page)] lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden overflow-hidden border-r border-[var(--color-border)] bg-slate-950 lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.25),transparent_24%),linear-gradient(180deg,#0f172a_0%,#111827_100%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-blue-200">
              ABR Associates
            </p>
            <h2 className="mt-6 max-w-xl text-5xl font-semibold leading-tight tracking-tight">
              A premium operations workspace for your recruitment business.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
              Track helper profiles, leads, documentation, payments, and reports in a clean manager dashboard built for daily operations.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Helper records", "Track helper country, type, added by, and current status in one place."],
              ["Sales funnel", "Move employers from prospect to deal closed with clear status visibility."],
              ["Documentation", "Monitor permits, visas, travel, arrival, and payment milestones."],
              ["Finance", "See revenue, profit, and cost breakdowns with manager-level clarity."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center p-6 md:p-10">
        <LoginForm error={params.error} demoMode={!configured} />
      </section>
    </main>
  );
}
