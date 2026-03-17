import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";
import { signOutAction } from "@/lib/actions";
import { getCurrentUserProfile } from "@/lib/auth";
import { getSession } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Access Denied",
};

export default async function AccessDeniedPage() {
  const session = await getSession();
  const profile = await getCurrentUserProfile();

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="mx-auto max-w-3xl p-8 md:p-10">
        <div className="w-fit rounded-2xl bg-rose-50 p-3 text-rose-700">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-rose-500">
          Access denied
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Sign in required
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
          {session && profile
            ? "Your account is signed in. Use the dashboard navigation to continue."
            : "You need to sign in with an authenticated account to access this internal system."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white"
            >
              Go to login
            </button>
          </form>
        </div>
      </Card>
    </main>
  );
}
