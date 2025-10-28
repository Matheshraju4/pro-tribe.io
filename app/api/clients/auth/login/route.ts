import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/authtoken";
import { z } from "zod";
//TODO: Add remember me functionality
// Schema for client login validation

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe, url } = body;

    console.log("Body", JSON.stringify(body, null, 2));

    // Find the client by email
    const client = await prisma.client.findUnique({
      where: { email: email },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if client has a password set
    if (!client.password) {
      return NextResponse.json(
        {
          error:
            "No password set for this account. Please contact your trainer.",
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, client.password);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate auth token
    const authToken = await generateToken(
      {
        role: "Client",
        email: client.email,
        userId: client.id,
        trainerId: client.trainerId,
      },
      rememberMe ? "30d" : "7d"
    );

    // Calculate maxAge in seconds
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;

    // Create the response
    const response = NextResponse.json(
      {
        message: "Login successful",
        client: {
          id: client.id,
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
        },
      },
      { status: 200 }
    );

    // Set the cookie on the response
    response.cookies.set("proTribe-client-authToken", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: maxAge,
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log("Validation error:", error.message);
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 }
      );
    }

    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
