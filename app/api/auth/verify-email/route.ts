import { generateToken, verifyToken } from "@/lib/authtoken";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Define the return type for verification result
interface VerificationResult {
  success: boolean;
  error?: string;
  role: string | null;
  message?: string;
  data?: { email: string; userId: string; trainerId?: string };
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid verification link. No token provided.",
        },
        { status: 400 }
      );
    }

    const result = await verifyEmail(token);

    // Set the cookie on the response

    if (result.success) {
      const authToken = await generateToken(
        {
          role: result.role,
          email: result.data?.email,
          userId: result.data?.userId,
          trainerId: result.data?.trainerId,
        },
        "7d"
      );

      const response = NextResponse.json({
        success: true,
        role: result.role,
        message: "Email verified successfully",
      });

      if (result.role === "Client") {
        response.cookies.set("proTribe-client-authToken", authToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60,
          path: "/",
        });
      }

      if (result.role === "Trainer") {
        response.cookies.set("proTribe-authToken", authToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60,
          path: "/",
        });
      }
      return response;
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "Verification failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function verifyEmail(token: string): Promise<VerificationResult> {
  try {
    const isVerified = await verifyToken(token);

    if (!isVerified) {
      return {
        success: false,
        error: "Invalid or expired verification token",
        role: null,
      };
    }

    if (isVerified.data.role === "Client") {
      const client = await prisma.client.findUnique({
        where: { email: isVerified.data.email },
      });

      if (!client) {
        return { success: false, error: "Client not found", role: "Client" };
      }

      // Check if already verified
      if (client.isVerified) {
        return {
          success: true,
          role: "Client",
          message: "Email already verified",
          data: {
            email: client.email,
            userId: client.id,
            trainerId: client.trainerId,
          },
        };
      }

      // Update isVerified field to true
      await prisma.client.update({
        where: { email: isVerified.data.email },
        data: { isVerified: true },
      });

      return {
        success: true,
        role: "Client",
        message: "Email verified successfully",
        data: {
          email: client.email,
          userId: client.id,
          trainerId: client.trainerId,
        },
      };
    }

    if (isVerified.data.role === "Trainer") {
      const trainer = await prisma.trainer.findUnique({
        where: { email: isVerified.data.email },
      });

      if (!trainer) {
        return { success: false, error: "Trainer not found", role: "Trainer" };
      }

      // Check if already verified
      if (trainer.isVerified) {
        return {
          success: true,
          role: "Trainer",
          message: "Email already verified",
          data: { email: trainer.email, userId: trainer.id },
        };
      }

      // Update isVerified field to true
      await prisma.trainer.update({
        where: { email: isVerified.data.email },
        data: { isVerified: true },
      });

      return {
        success: true,
        role: "Trainer",
        message: "Email verified successfully",
        data: { email: trainer.email, userId: trainer.id },
      };
    }

    return { success: false, error: "Invalid user role", role: null };
  } catch (error) {
    console.error("Verify email error:", error);
    return { success: false, error: "Verification failed", role: null };
  }
}
