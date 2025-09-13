import { fetchUserInfo } from "@/lib/next-auth";
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

    const userInfo = await fetchUserInfo(code);

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
    console.log("User Details", userData);

    // Return both the access token and user data
    return NextResponse.json({
      access_token: userInfo.access_token,
      user: userData,
    });
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
