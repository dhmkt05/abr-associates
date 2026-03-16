import { redirect } from "next/navigation";
import { getLoginRedirectPath } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { getSession } from "@/lib/supabase/server";

export default async function HomePage() {
  if (!isSupabaseConfigured()) {
    redirect("/dashboard");
  }

  const session = await getSession();
  redirect(session ? await getLoginRedirectPath() : "/login");
}
