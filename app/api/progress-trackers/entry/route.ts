import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getClientSession } from "@/lib/authtoken";
import { z } from "zod";

// Schema for adding a progress entry
const progressEntrySchema = z.object({
  clientProgressId: z.string().min(1, "Client progress ID is required"),
  value: z.union([z.number(), z.boolean(), z.string()]),
  note: z.string().optional(),
  entryDate: z.string().optional(), // ISO date string
});

// POST method to add a new progress entry
export async function POST(request: NextRequest) {
  try {
    const session = await getClientSession(request);

    if (!session || !session.data.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login as a client." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = progressEntrySchema.parse(body);

    // Verify that the client progress belongs to the logged-in client
    const clientProgress = await prisma.clientProgress.findFirst({
      where: {
        id: validatedData.clientProgressId,
        clientId: session.data.userId,
      },
      include: {
        tracker: true,
      },
    });

    if (!clientProgress) {
      return NextResponse.json(
        {
          success: false,
          error: "Progress tracker not found or not assigned to you",
        },
        { status: 404 }
      );
    }

    // Create the progress entry
    const entry = await prisma.progressEntry.create({
      data: {
        clientProgressId: validatedData.clientProgressId,
        value: validatedData.value,
        note: validatedData.note,
        entryDate: validatedData.entryDate
          ? new Date(validatedData.entryDate)
          : new Date(),
      },
    });

    console.log("Progress entry created successfully:", entry);

    return NextResponse.json(
      {
        success: true,
        message: "Progress entry added successfully",
        entry: {
          id: entry.id,
          value: entry.value,
          note: entry.note,
          date: entry.entryDate.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create progress entry:", error);

    // Handle validation errors
    if (error.name === "ZodError") {
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
      {
        success: false,
        error: "Failed to add progress entry",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
