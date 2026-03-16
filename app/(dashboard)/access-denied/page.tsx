import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { requirePageAccess } from "@/lib/auth";
import { roleLandingPath } from "@/lib/rbac";
import { Card } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Access Denied",
};

export default async function AccessDeniedPage() {
  const { profile } = await requirePageAccess("access-denied");
  const landing = roleLandingPath[profile.role];

  return (
    <Card className="mx-auto max-w-3xl p-8 md:p-10">
      <div className="rounded-2xl bg-rose-50 p-3 text-rose-700 w-fit">
        <ShieldAlert className="h-6 w-6" />
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-rose-500">
        Access denied
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        You do not have permission to open this page
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
        Your current role is <span className="font-semibold text-slate-800">{profile.role}</span>.
        Use your assigned workspace instead, or ask an admin to update your profile role in Supabase.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={landing} className={buttonClassName("primary")}>
          Go to my allowed page
        </Link>
        <Link href="/login" className={buttonClassName("secondary")}>
          Back to login
        </Link>
      </div>
    </Card>
  );
}
