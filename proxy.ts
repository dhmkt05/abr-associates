import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  ACCESS_NOT_CONFIGURED_ERROR,
  canRoleAccessPage,
  getLandingPathForRole,
  getRoleForEmail,
  type ProtectedPage,
} from "@/lib/access-control";
import { isSupabaseConfigured } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";
import { buildRedirectUrl } from "@/lib/utils";

function resolvePageFromPathname(pathname: string): ProtectedPage | null {
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/helpers")) return "helpers";
  if (pathname.startsWith("/sales")) return "sales";
  if (pathname.startsWith("/documentation")) return "documentation";
  if (pathname.startsWith("/finance")) return "finance";
  if (pathname.startsWith("/reports")) return "reports";
  if (pathname.startsWith("/settings")) return "settings";

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
  const role = getRoleForEmail(user.email);

  if (!role) {
    return NextResponse.redirect(
      new URL(
        buildRedirectUrl("/login", {
          error: ACCESS_NOT_CONFIGURED_ERROR,
        }),
        request.url,
      ),
    );
  }

  const page = resolvePageFromPathname(request.nextUrl.pathname);

  if (page && !canRoleAccessPage(role, page)) {
    return NextResponse.redirect(new URL(getLandingPathForRole(role), request.url));
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
