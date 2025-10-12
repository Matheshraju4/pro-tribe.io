import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/authtoken";

// GET method to fetch all progress trackers for a trainer
export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trackers = await prisma.progressTracker.findMany({
      where: {
        trainerId: session.data.userId,
        isActive: true,
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
              },
            },
            entries: {
              take: 3, // Get last 3 entries per client
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      trackers: trackers,
      total: trackers.length,
    });
  } catch (error) {
    console.error("Failed to fetch progress trackers:", error);
    return NextResponse.json(
      { error: "Failed to fetch progress trackers" },
      { status: 500 }
    );
  }
}

// POST method to create a new progress tracker
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    console.log("Received progress tracker data:", data);

    // Validate required fields
    if (!data.name || !data.type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    // Create configuration object based on type
    let configuration = {};

    if (data.type === "numeric") {
      configuration = {
        unit: data.unit,
        minValue: data.minValue,
        maxValue: data.maxValue,
      };
    } else if (data.type === "boolean") {
      configuration = {
        trueLabel: data.trueLabel || "Yes",
        falseLabel: data.falseLabel || "No",
      };
    } else if (data.type === "rating") {
      configuration = {
        ratingScale: data.ratingScale || 5,
      };
    }

    // Create the progress tracker
    const tracker = await prisma.progressTracker.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        unit: data.unit,
        minValue: data.minValue,
        maxValue: data.maxValue,
        trueLabel: data.trueLabel,
        falseLabel: data.falseLabel,
        ratingScale: data.ratingScale,
        configuration: configuration,
        trainerId: session.data.userId,
      },
    });

    console.log("Progress tracker created successfully:", tracker);

    return NextResponse.json(
      {
        message: "Progress tracker created successfully",
        tracker: tracker,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create progress tracker:", error);

    return NextResponse.json(
      { error: "Failed to create progress tracker" },
      { status: 500 }
    );
  }
}
