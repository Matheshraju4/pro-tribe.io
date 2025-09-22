import { generateToken } from "@/lib/authtoken";
import { fetchUserInfo } from "@/lib/next-auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Define the type for Google user info
interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code is required" },
        { status: 400 }
      );
    }

    console.log("Code", code);
    const userInfo = await fetchUserInfo(code);
    console.log("User Info", userInfo);

    const userDataResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${userInfo.access_token}`,
        },
      }
    );

    if (!userDataResponse.ok) {
      throw new Error("Failed to fetch user data");
    }

    const userData: GoogleUserInfo = await userDataResponse.json();

    const trainer = await prisma.trainer.findUnique({
      where: {
        email: userData.email,
      },
    });
    if (!trainer) {
      return NextResponse.redirect(
        new URL("/trainer/auth/signup", process.env.APPLICATION_BASIC_URL)
      );
    }

    const authToken = await generateToken(
      {
        role: "Trainer",
        email: trainer.email,
        userId: trainer.id,
      },
      "7d"
    );

    // Create redirect response instead of JSON response
    const response = NextResponse.redirect(
      new URL("/trainer", process.env.APPLICATION_BASIC_URL)
    );

    // Set the cookie on the response
    response.cookies.set("proTribe-authToken", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
