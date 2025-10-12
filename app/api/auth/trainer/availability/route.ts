import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/authtoken";

// GET - Fetch trainer's availability
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const availability = await prisma.trainerAvailability.findMany({
      where: {
        trainerId: session.data.userId,
        isActive: true,
      },
      orderBy: {
        dayOfWeek: "asc",
      },
    });

    return NextResponse.json({ availability }, { status: 200 });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

// POST - Create or update trainer's availability
export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { availability } = body;

    if (!Array.isArray(availability)) {
      return NextResponse.json(
        { error: "Invalid availability data" },
        { status: 400 }
      );
    }

    // Delete all existing availability for this trainer
    await prisma.trainerAvailability.deleteMany({
      where: { trainerId: session.data.userId },
    });

    // Create new availability records
    const createdAvailability = await prisma.trainerAvailability.createMany({
      data: availability.map((slot: any) => ({
        trainerId: session.data.userId,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isActive: true,
      })),
    });

    return NextResponse.json(
      { message: "Availability updated successfully", createdAvailability },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    );
  }
}

// DELETE - Delete specific availability
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dayOfWeek = searchParams.get("dayOfWeek");

    if (!dayOfWeek) {
      return NextResponse.json(
        { error: "Day of week is required" },
        { status: 400 }
      );
    }

    await prisma.trainerAvailability.deleteMany({
      where: {
        trainerId: session.data.userId,
        dayOfWeek: dayOfWeek as any,
      },
    });

    return NextResponse.json(
      { message: "Availability deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting availability:", error);
    return NextResponse.json(
      { error: "Failed to delete availability" },
      { status: 500 }
    );
  }
}

