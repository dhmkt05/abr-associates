import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "@/lib/env";
import { roleLandingPath, type ProtectedPage } from "@/lib/rbac";
import { updateSession } from "@/lib/supabase/middleware";

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

  if (!profile) {
    if (!request.nextUrl.pathname.startsWith("/access-denied")) {
      return NextResponse.redirect(new URL("/access-denied?reason=missing-profile", request.url));
    }

    return sessionResponse;
  }

  const pageMap: Array<[string, ProtectedPage]> = [
    ["/dashboard", "dashboard"],
    ["/helpers", "helpers"],
    ["/sales", "sales"],
    ["/documentation", "documentation"],
    ["/finance", "finance"],
    ["/reports", "reports"],
    ["/settings", "settings"],
    ["/access-denied", "access-denied"],
  ];

  const matched = pageMap.find(([prefix]) =>
    request.nextUrl.pathname.startsWith(prefix),
  );

  if (!matched) {
    return sessionResponse;
  }

  const role = profile.role as keyof typeof roleLandingPath;
  const allowedMap: Record<typeof role, string[]> = {
    admin: ["/dashboard", "/helpers", "/sales", "/documentation", "/finance", "/reports", "/settings", "/access-denied"],
    data_team: ["/helpers", "/access-denied"],
    sales_team: ["/sales", "/helpers", "/access-denied"],
    documentation_team: ["/documentation", "/access-denied"],
  };

  const allowed = allowedMap[role]?.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );

  if (!allowed) {
    return NextResponse.redirect(
      new URL(`/access-denied?from=${encodeURIComponent(request.nextUrl.pathname)}`, request.url),
    );
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
    "/access-denied/:path*",
  ],
};
