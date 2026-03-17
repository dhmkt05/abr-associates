import { redirect } from "next/navigation";
import { getLoginRedirectPath } from "@/lib/auth";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function AuthCallbackPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const redirectPath = await getLoginRedirectPath();

  console.log("[auth-callback] redirect decision", {
    authUserEmail: user.email ?? null,
    authUserId: user.id,
    finalResolvedRolePath: redirectPath,
  });

  if (!redirectPath) {
    redirect("/login?error=No matching role profile was found.");
  }

  redirect(redirectPath);
}
