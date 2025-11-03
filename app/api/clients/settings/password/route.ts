import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getClientSession } from "@/lib/authtoken";
import { z } from "zod";
import bcrypt from "bcryptjs";

// Schema for password change
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getClientSession(request);

    if (!session || !session.data.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = passwordChangeSchema.parse(body);

    // Fetch client with current password
    const client = await prisma.client.findUnique({
      where: {
        id: session.data.userId,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    // Verify current password
    if (!client.password) {
      return NextResponse.json(
        { success: false, error: "No password set for this account" },
        { status: 400 }
      );
    }

    const isPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      client.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 10);

    // Update password
    await prisma.client.update({
      where: {
        id: session.data.userId,
      },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error: any) {
    console.error("Failed to change password:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to change password" },
      { status: 500 }
    );
  }
}

