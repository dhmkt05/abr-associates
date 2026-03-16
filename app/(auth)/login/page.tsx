import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { isSupabaseConfigured } from "@/lib/env";
import { getSession } from "@/lib/supabase/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const configured = isSupabaseConfigured();

  if (configured) {
    const session = await getSession();
    if (session) {
      redirect("/dashboard");
    }
  }

  const params = await searchParams;

  return (
    <main className="grid min-h-screen grid-cols-1 bg-[var(--color-page)] lg:grid-cols-[1.1fr_0.9fr]">
      <section className="grid-pattern relative hidden overflow-hidden border-r border-[var(--color-border)] lg:block">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(31,77,67,0.78),rgba(184,116,68,0.65))]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-emerald-100">
              ABR Associates
            </p>
            <h2 className="mt-6 max-w-xl text-5xl font-bold leading-tight">
              One private workspace for your helper recruitment business.
            </h2>
            <p className="mt-6 max-w-lg text-base text-white/80">
              Track helper profiles, leads, documentation, payments, and reports in a clean manager dashboard built for daily operations.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Helper database and search",
              "Sales pipeline with lead stages",
              "Documentation stage tracking",
              "Revenue and profit visibility",
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm font-medium">{item}</p>
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
