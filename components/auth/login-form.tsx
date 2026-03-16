import Link from "next/link";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { loginAction } from "@/lib/actions";
import { buttonClassName } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

export function LoginForm({
  error,
  demoMode,
}: {
  error?: string;
  demoMode: boolean;
}) {
  return (
    <Card className="w-full max-w-md rounded-[32px] border-white/70 bg-white/95 p-8">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          <ShieldCheck className="h-3.5 w-3.5" />
          Secure manager access
        </div>
        <p className="mt-5 font-mono text-xs uppercase tracking-[0.24em] text-[var(--color-accent)]">
          Manager Login
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Welcome back
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Sign in to manage helper recruitment, sales progress, documentation, and finance.
        </p>
      </div>

      {demoMode ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4 text-sm text-slate-600">
          Supabase is not configured yet. You can preview the dashboard in demo mode, but authentication and database writes stay disabled until the environment variables are added.
          <div className="mt-4">
            <Link href="/dashboard" className={buttonClassName("secondary")}>
              Open demo dashboard
            </Link>
          </div>
        </div>
      ) : (
        <form action={loginAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Mail className="h-4 w-4" />
              Email
            </span>
            <Input type="email" name="email" placeholder="manager@abrassociates.com" required />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <LockKeyhole className="h-4 w-4" />
              Password
            </span>
            <Input type="password" name="password" placeholder="Enter your password" required />
          </label>

          {error ? (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
          ) : null}

          <SubmitButton label="Sign in" pendingLabel="Signing in..." className="w-full" />
        </form>
      )}
    </Card>
  );
}
