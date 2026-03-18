import { redirect } from "next/navigation";
import { ACCESS_NOT_CONFIGURED_ERROR } from "@/lib/access-control";
import { getCurrentUserProfile, getLoginRedirectPath } from "@/lib/auth";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function AuthCallbackPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect(`/login?error=${encodeURIComponent(ACCESS_NOT_CONFIGURED_ERROR)}`);
  }

  redirect(await getLoginRedirectPath());
}
