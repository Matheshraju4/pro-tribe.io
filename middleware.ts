import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/authtoken";

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies();
  const pathname = request.nextUrl.pathname;

  // Handle Trainer routes
  if (pathname.startsWith("/trainer")) {
    const authToken = cookieStore.get("proTribe-authToken");

    if (authToken) {
      console.log("Trainer auth token found", authToken);

      const isVerified = await verifyToken(authToken.value);
      if (!isVerified) {
        return NextResponse.redirect(new URL("/trainer/login", request.url));
      }

      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/trainer/login", request.url));
  }

  // Handle Client routes (dashboard, settings, progress-tracking, etc.)
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/progress-tracking") ||
    pathname.startsWith("/credits-bundles")
  ) {
    const authToken = cookieStore.get("proTribe-client-authToken");

    if (authToken) {
      console.log("Client auth token found", authToken);

      const isVerified = await verifyToken(authToken.value);
      if (!isVerified) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Trainer routes (exclude login and signup)
    "/trainer/((?!login|signup).*)",
    // Client routes
    "/dashboard/:path*",
    "/settings/:path*",
    "/progress-tracking/:path*",
    "/credits-bundles/:path*",
  ],
};