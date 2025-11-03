import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getClientSession } from "@/lib/authtoken";

// GET method to fetch assigned progress trackers for a client
export async function GET(request: NextRequest) {
  try {
    const session = await getClientSession(request);

    if (!session || !session.data.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login as a client." },
        { status: 401 }
      );
    }

    const clientId = session.data.userId;

    // Fetch all assigned progress trackers with their entries
    const clientProgress = await prisma.clientProgress.findMany({
      where: {
        clientId: clientId,
        isActive: true,
      },
      include: {
        tracker: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            unit: true,
            minValue: true,
            maxValue: true,
            trueLabel: true,
            falseLabel: true,
            ratingScale: true,
            configuration: true,
            trainer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        entries: {
          orderBy: { entryDate: "desc" },
          take: 10, // Get last 10 entries
        },
      },
      orderBy: {
        assignedAt: "desc",
      },
    });

    // Transform the data for easier frontend consumption
    const trackers = clientProgress.map((cp) => {
      const entries = cp.entries.map((entry) => ({
        id: entry.id,
        date: entry.entryDate.toISOString(),
        value: entry.value,
        note: entry.note,
      }));

      // Calculate current value, target value, and progress
      let currentValue = null;
      let targetValue = null;
      let progress = 0;
      let trend = "stable";

      if (entries.length > 0) {
        currentValue = entries[0].value;

        // For numeric trackers, calculate progress
        if (
          cp.tracker.type === "numeric" &&
          cp.tracker.maxValue &&
          cp.tracker.minValue !== null
        ) {
          const current = Number(currentValue);
          const max = cp.tracker.maxValue;
          const min = cp.tracker.minValue || 0;

          // Calculate progress as percentage
          progress = Math.round(((current - min) / (max - min)) * 100);

          // Calculate trend
          if (entries.length >= 2) {
            const previous = Number(entries[1].value);
            trend =
              current > previous
                ? "up"
                : current < previous
                ? "down"
                : "stable";
          }
        }

        // Set target value from tracker config
        const config = cp.tracker.configuration as { target?: number } | null;
        targetValue = cp.tracker.maxValue || config?.target || null;
      }

      return {
        id: cp.id,
        trackerId: cp.tracker.id,
        name: cp.tracker.name,
        description: cp.tracker.description,
        type: cp.tracker.type,
        unit: cp.tracker.unit,
        minValue: cp.tracker.minValue,
        maxValue: cp.tracker.maxValue,
        trueLabel: cp.tracker.trueLabel,
        falseLabel: cp.tracker.falseLabel,
        ratingScale: cp.tracker.ratingScale,
        currentValue,
        targetValue,
        progress,
        trend,
        assignedBy: cp.tracker.trainer.name,
        assignedDate: cp.assignedAt.toISOString(),
        entries,
      };
    });

    return NextResponse.json({
      success: true,
      trackers,
      total: trackers.length,
    });
  } catch (error) {
    console.error("Failed to fetch client progress trackers:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch progress trackers",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
