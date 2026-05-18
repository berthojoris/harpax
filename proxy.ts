import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

const protectedRoutes = ["/dashboard", "/attendance", "/report", "/profile"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(request.cookies.get(siteConfig.sessionCookieName)?.value);
  const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (isProtectedRoute && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/attendance/:path*", "/report/:path*", "/profile/:path*"],
};
