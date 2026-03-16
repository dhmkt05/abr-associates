import { redirect } from "next/navigation";
import { DemoBanner } from "@/components/demo-banner";
import { Sidebar } from "@/components/layout/sidebar";
import { isSupabaseConfigured } from "@/lib/env";
import { getSession } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const configured = isSupabaseConfigured();

  if (configured) {
    const session = await getSession();

    if (!session) {
      redirect("/login");
    }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[272px_1fr]">
      <Sidebar />
      <main className="px-4 pb-6 pt-0 md:px-6 md:pb-8 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-5 md:space-y-6">
          {!configured ? <DemoBanner /> : null}
          {children}
        </div>
      </main>
    </div>
  );
}
