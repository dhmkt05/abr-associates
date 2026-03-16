import { getSession, getSupabaseServerClient } from "@/lib/supabase/server";
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
  const [session, profile, supabase] = await Promise.all([
    getSession(),
    getCurrentUserProfile(),
    getSupabaseServerClient(),
  ]);

  if (!session || !profile || !supabase) {
    return;
  }

  await supabase.from("activity_logs").insert({
    user_id: session.user.id,
    user_email: profile.email,
    role: profile.role,
    action,
    entity_type: entityType,
    entity_id: entityId,
    description,
  });
}
