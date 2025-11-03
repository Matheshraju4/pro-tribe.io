import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/authtoken";
import { z } from "zod";

// Schema for updating progress tracker
const updateTrackerSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  unit: z.string().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  trueLabel: z.string().optional(),
  falseLabel: z.string().optional(),
  ratingScale: z.number().optional(),
  isActive: z.boolean().optional(),
});

// GET single tracker with details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const tracker = await prisma.progressTracker.findFirst({
      where: {
        id,
        trainerId: session.data.userId,
      },
      include: {
        clientProgress: {
          include: {
            client: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
            entries: {
              take: 10,
              orderBy: { entryDate: "desc" },
            },
            _count: {
              select: { entries: true },
            },
          },
        },
        _count: {
          select: { clientProgress: true },
        },
      },
    });

    if (!tracker) {
      return NextResponse.json(
        { error: "Progress tracker not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      tracker,
    });
  } catch (error) {
    console.error("Failed to fetch progress tracker:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress tracker" },
      { status: 500 }
    );
  }
}

// PUT/PATCH - Update tracker
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateTrackerSchema.parse(body);

    // Verify tracker belongs to this trainer
    const existingTracker = await prisma.progressTracker.findFirst({
      where: {
        id,
        trainerId: session.data.userId,
      },
    });

    if (!existingTracker) {
      return NextResponse.json(
        { error: "Progress tracker not found" },
        { status: 404 }
      );
    }

    // Update configuration if needed
    let configuration = existingTracker.configuration;
    if (existingTracker.type === "numeric" && (validatedData.unit || validatedData.minValue !== undefined || validatedData.maxValue !== undefined)) {
      configuration = {
        ...(typeof configuration === 'object' ? configuration : {}),
        unit: validatedData.unit ?? (configuration as any)?.unit,
        minValue: validatedData.minValue ?? (configuration as any)?.minValue,
        maxValue: validatedData.maxValue ?? (configuration as any)?.maxValue,
      };
    }

    // Update the tracker
    const updatedTracker = await prisma.progressTracker.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.unit && { unit: validatedData.unit }),
        ...(validatedData.minValue !== undefined && { minValue: validatedData.minValue }),
        ...(validatedData.maxValue !== undefined && { maxValue: validatedData.maxValue }),
        ...(validatedData.trueLabel && { trueLabel: validatedData.trueLabel }),
        ...(validatedData.falseLabel && { falseLabel: validatedData.falseLabel }),
        ...(validatedData.ratingScale && { ratingScale: validatedData.ratingScale }),
        ...(validatedData.isActive !== undefined && { isActive: validatedData.isActive }),
        configuration,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Progress tracker updated successfully",
      tracker: updatedTracker,
    });
  } catch (error: any) {
    console.error("Failed to update progress tracker:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update progress tracker" },
      { status: 500 }
    );
  }
}

// DELETE - Delete tracker
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify tracker belongs to this trainer
    const existingTracker = await prisma.progressTracker.findFirst({
      where: {
        id,
        trainerId: session.data.userId,
      },
    });

    if (!existingTracker) {
      return NextResponse.json(
        { error: "Progress tracker not found" },
        { status: 404 }
      );
    }

    // Soft delete - set isActive to false
    await prisma.progressTracker.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Progress tracker deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete progress tracker:", error);
    return NextResponse.json(
      { error: "Failed to delete progress tracker" },
      { status: 500 }
    );
  }
}

