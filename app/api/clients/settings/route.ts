import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getClientSession } from "@/lib/authtoken";
import { z } from "zod";

// Schema for updating client settings
const updateClientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
});

// GET - Fetch client settings
export async function GET(request: NextRequest) {
  try {
    const session = await getClientSession(request);

    if (!session || !session.data.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    const client = await prisma.client.findUnique({
      where: {
        id: session.data.userId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      client,
    });
  } catch (error) {
    console.error("Failed to fetch client settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT - Update client settings
export async function PUT(request: NextRequest) {
  try {
    const session = await getClientSession(request);

    if (!session || !session.data.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateClientSchema.parse(body);

    // Check if email is being changed and if it's already in use
    if (validatedData.email) {
      const existingClient = await prisma.client.findFirst({
        where: {
          email: validatedData.email,
          NOT: {
            id: session.data.userId,
          },
        },
      });

      if (existingClient) {
        return NextResponse.json(
          { success: false, error: "Email is already in use by another account" },
          { status: 400 }
        );
      }
    }

    // Update client
    const updatedClient = await prisma.client.update({
      where: {
        id: session.data.userId,
      },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone || null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      client: updatedClient,
      message: "Settings updated successfully",
    });
  } catch (error: any) {
    console.error("Failed to update client settings:", error);

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
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}

