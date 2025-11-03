import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/authtoken";
import { z } from "zod";

// Schema for adding a progress entry by trainer
const trainerProgressEntrySchema = z.object({
  clientProgressId: z.string().min(1, "Client progress ID is required"),
  value: z.union([z.number(), z.boolean(), z.string()]),
  note: z.string().optional(),
  entryDate: z.string().optional(), // ISO date string
});

// POST method for trainer to add progress entry for a client
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session || !session.data.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login as a trainer." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = trainerProgressEntrySchema.parse(body);

    // Verify that the client progress belongs to a client of this trainer
    const clientProgress = await prisma.clientProgress.findFirst({
      where: {
        id: validatedData.clientProgressId,
      },
      include: {
        tracker: {
          select: {
            trainerId: true,
            type: true,
            name: true,
          },
        },
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            trainerId: true,
          },
        },
      },
    });

    if (!clientProgress) {
      return NextResponse.json(
        { success: false, error: "Progress tracker assignment not found" },
        { status: 404 }
      );
    }

    // Verify trainer owns this tracker
    if (clientProgress.tracker.trainerId !== session.data.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. This tracker does not belong to you." },
        { status: 403 }
      );
    }

    // Verify client belongs to this trainer
    if (clientProgress.client.trainerId !== session.data.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. This client is not assigned to you." },
        { status: 403 }
      );
    }

    // Create the progress entry
    const entry = await prisma.progressEntry.create({
      data: {
        clientProgressId: validatedData.clientProgressId,
        value: validatedData.value,
        note: validatedData.note,
        entryDate: validatedData.entryDate ? new Date(validatedData.entryDate) : new Date(),
      },
    });

    console.log("Trainer progress entry created successfully:", entry);

    return NextResponse.json(
      {
        success: true,
        entry,
        message: `Progress entry added for ${clientProgress.client.firstName} ${clientProgress.client.lastName}`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create trainer progress entry:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create progress entry",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

