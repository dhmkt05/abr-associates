import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "@/lib/env";
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
