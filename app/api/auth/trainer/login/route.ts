import { trainerLoginBackendSchema } from "@/lib/schemas/auth";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/authtoken";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = trainerLoginBackendSchema.parse(body);
    const { email, password, rememberMe } = validatedData;

    const trainer = await prisma.trainer.findUnique({
      where: { email: email },
    });

    if (!trainer) {
      return NextResponse.json(
        { message: "Trainer not found" },
        { status: 404 }
      );
    }

    const isPasswordCorrect = await bcrypt.compare(password, trainer.password!);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }

    const authToken = await generateToken(
      {
        role: "Trainer",
        email: trainer.email,
      },
      rememberMe ? "30d" : "7d"
    );

    // Calculate maxAge in seconds
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // in seconds

    // Create the response
    const response = NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );

    // Set the cookie on the response
    response.cookies.set("proTribe-authToken", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: maxAge,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
