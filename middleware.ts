import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/authtoken";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("proTribe-authToken");

  if (authToken) {
    console.log("Auth token found", authToken);

    const isVerified = await verifyToken(authToken.value);
    if (!isVerified) {
      return NextResponse.redirect(new URL("/trainer/login", request.url));
    }

    return NextResponse.next();
  }

  // Use NextResponse.redirect instead of redirect()
  return NextResponse.redirect(new URL("/trainer/login", request.url));
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/trainer/((?!login|signup).)*"],
};
