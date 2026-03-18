import { requireAuthenticatedProfile } from "@/lib/auth";
import { DemoBanner } from "@/components/demo-banner";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { isSupabaseConfigured } from "@/lib/env";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const configured = isSupabaseConfigured();
  const access = configured ? await requireAuthenticatedProfile() : null;

  return (
    <div className="admin-shell min-h-screen xl:grid xl:grid-cols-[280px_1fr]">
      <AppSidebar role={access?.profile.role} />
      <main className="px-4 pb-8 pt-4 md:px-6 xl:px-8 xl:py-8">
        <div className="mx-auto max-w-[1520px] space-y-6">
          {!configured ? <DemoBanner /> : null}
          {children}
        </div>
      </main>
    </div>
  );
}
