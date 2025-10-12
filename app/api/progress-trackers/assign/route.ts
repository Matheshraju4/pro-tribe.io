import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/authtoken";

// POST - Assign tracker to clients
export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { trackerId, clientIds } = body;

    if (!trackerId || !Array.isArray(clientIds)) {
      return NextResponse.json(
        { error: "Tracker ID and client IDs are required" },
        { status: 400 }
      );
    }

    // Verify tracker belongs to the trainer
    const tracker = await prisma.progressTracker.findFirst({
      where: {
        id: trackerId,
        trainerId: session.data.userId,
      },
    });

    if (!tracker) {
      return NextResponse.json(
        { error: "Tracker not found" },
        { status: 404 }
      );
    }

    // Verify all clients belong to the trainer
    if (clientIds.length > 0) {
      const clients = await prisma.client.findMany({
        where: {
          id: { in: clientIds },
          trainerId: session.data.userId,
        },
      });

      if (clients.length !== clientIds.length) {
        return NextResponse.json(
          { error: "Some clients not found or don't belong to you" },
          { status: 400 }
        );
      }
    }

    // Delete existing assignments for this tracker
    await prisma.clientProgress.deleteMany({
      where: {
        trackerId: trackerId,
      },
    });

    // Create new assignments
    if (clientIds.length > 0) {
      await prisma.clientProgress.createMany({
        data: clientIds.map((clientId: string) => ({
          trackerId: trackerId,
          clientId: clientId,
          isActive: true,
        })),
      });
    }

    // Fetch updated tracker with assignments
    const updatedTracker = await prisma.progressTracker.findUnique({
      where: { id: trackerId },
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
          },
        },
        _count: {
          select: {
            clientProgress: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Tracker assignments updated successfully",
        tracker: updatedTracker,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error assigning tracker:", error);
    return NextResponse.json(
      { error: "Failed to update tracker assignments" },
      { status: 500 }
    );
  }
}

// GET - Get tracker assignments
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const trackerId = searchParams.get("trackerId");

    if (!trackerId) {
      return NextResponse.json(
        { error: "Tracker ID is required" },
        { status: 400 }
      );
    }

    const tracker = await prisma.progressTracker.findFirst({
      where: {
        id: trackerId,
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
              },
            },
          },
        },
      },
    });

    if (!tracker) {
      return NextResponse.json(
        { error: "Tracker not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ tracker }, { status: 200 });
  } catch (error) {
    console.error("Error fetching tracker assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracker assignments" },
      { status: 500 }
    );
  }
}
