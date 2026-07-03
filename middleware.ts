import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/auth/update-session";

export async function middleware(request: NextRequest) {
  // 1. Always refresh session first
  const response = await updateSession(request);

  const { pathname } = request.nextUrl;

  // 2. Check if route is admin
  const isAdminRoute = pathname.startsWith("/admin");

  // Ignore login page itself
  const isLoginPage = pathname === "login";

  // 3. Get session from cookies
  const accessToken = request.cookies.get(
    "sb-access-token"
  )?.value;

  const isAuthenticated = !!accessToken;

  // ==============================
  // 🔐 PROTECT ADMIN ROUTES
  // ==============================
  if (isAdminRoute) {
    // If NOT logged in → redirect to login
    if (!isAuthenticated && !isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "login";
      return NextResponse.redirect(url);
    }

    // If logged in and tries to access login → redirect dashboard
    if (isAuthenticated && isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "dashboard";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};