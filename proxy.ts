import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { canAccessPage, roleLandingPath, type ProtectedPage } from "@/lib/rbac";
import { isSupabaseConfigured } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";

function normalizeRole(role: string | null | undefined) {
  const normalized = role?.trim().toLowerCase();

  if (normalized === "data_team") {
    return "data_team";
  }

  if (normalized === "admin") {
    return "admin";
  }

  return null;
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  const sessionResponse = await updateSession(request, response);

  if (!isSupabaseConfigured()) {
    return sessionResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            sessionResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = normalizeRole(profile?.role) ?? "admin";

  const pageMap: Array<[string, ProtectedPage]> = [
    ["/dashboard", "dashboard"],
    ["/helpers", "helpers"],
    ["/sales", "sales"],
    ["/documentation", "documentation"],
    ["/finance", "finance"],
    ["/reports", "reports"],
    ["/settings", "settings"],
  ];

  const matched = pageMap.find(([prefix]) =>
    request.nextUrl.pathname.startsWith(prefix),
  );

  if (!matched) {
    return sessionResponse;
  }

  const [, page] = matched;

  if (!canAccessPage(role, page)) {
    return NextResponse.redirect(new URL(roleLandingPath[role], request.url));
  }

  return sessionResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/helpers/:path*",
    "/sales/:path*",
    "/documentation/:path*",
    "/finance/:path*",
    "/reports/:path*",
    "/settings/:path*",
  ],
};
