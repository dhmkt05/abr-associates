import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  return updateSession(request, response);
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
