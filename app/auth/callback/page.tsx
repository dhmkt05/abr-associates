import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/auth";
import { roleLandingPath } from "@/lib/rbac";
import { getCurrentUser, signOutServerSession } from "@/lib/supabase/server";

export default async function AuthCallbackPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await getCurrentUserProfile();

  if (!profile) {
    await signOutServerSession();
    redirect("/login?error=No matching role profile was found. Please contact admin.");
  }

  redirect(roleLandingPath[profile.role]);
}
