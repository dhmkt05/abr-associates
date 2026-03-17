import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { signOutAction } from "@/lib/actions";
import { getCurrentUserProfile } from "@/lib/auth";
import { roleLandingPath } from "@/lib/rbac";
import { getSession } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Access Denied",
};

export default async function AccessDeniedPage() {
  const session = await getSession();
  const profile = await getCurrentUserProfile();
  const landing = profile ? roleLandingPath[profile.role] : "/login";

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
          You do not have permission to open this page
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
          {profile ? (
            <>
              Your current role is{" "}
              <span className="font-semibold text-slate-800">{profile.role}</span>. Use
              your assigned workspace instead, or ask an admin to update your role.
            </>
          ) : session ? (
            "Your account is signed in, but no matching profile was found in public.profiles."
          ) : (
            "You need to sign in with an authorized account to access this internal system."
          )}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {profile ? (
            <Link href={landing} className={buttonClassName("primary")}>
              Go to my allowed page
            </Link>
          ) : (
            <form action={signOutAction}>
              <button type="submit" className={buttonClassName("primary")}>
                Sign out and go to login
              </button>
            </form>
          )}
          <form action={signOutAction}>
            <button type="submit" className={buttonClassName("secondary")}>
              Back to login
            </button>
          </form>
        </div>
      </Card>
    </main>
  );
}
