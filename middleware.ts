import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authApiPrefix = "/api/auth";
const publicRoutes = ["/"];
const authRoutes = ["/sign-in"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow all API routes (they handle auth themselves)
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Always allow Better Auth API routes
  if (pathname.startsWith(authApiPrefix)) {
    return NextResponse.next();
  }

  const sessionCookie =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token");

  const isAuthenticated = !!sessionCookie;

  // If authenticated and trying to visit /sign-in → redirect to home
  if (isAuthenticated && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If unauthenticated and NOT on a public/auth route → redirect to /sign-in
  const isPublic =
    publicRoutes.includes(pathname) || authRoutes.includes(pathname);
  if (!isAuthenticated && !isPublic) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|ico)$).*)",
  ],
};
