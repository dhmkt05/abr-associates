import { getCurrentUser, getSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/auth";

export async function logActivity({
  action,
  entityType,
  entityId,
  description,
}: {
  action: string;
  entityType: string;
  entityId: string;
  description: string;
}) {
  const [user, profile, supabase] = await Promise.all([
    getCurrentUser(),
    getCurrentUserProfile(),
    getSupabaseServerClient(),
  ]);

  if (!user || !supabase) {
    return;
  }

  await supabase.from("activity_logs").insert({
    user_id: user.id,
    user_email: profile?.email ?? user.email ?? "admin",
    role: "admin",
    action,
    entity_type: entityType,
    entity_id: entityId,
    description,
  });
}
