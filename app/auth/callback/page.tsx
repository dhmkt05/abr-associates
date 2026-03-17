import { redirect } from "next/navigation";
import { getLoginRedirectPath } from "@/lib/auth";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function AuthCallbackPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  redirect(await getLoginRedirectPath());
}
