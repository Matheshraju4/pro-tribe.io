import { getClientSession } from "@/lib/authtoken";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID parameter is required" },
        { status: 400 }
      );
    }

    // Get client session to determine trainerId
    const session = await getClientSession(request);
    if (!session || !session.data.trainerId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    const trainerId = session.data.trainerId;

    // Try to find the item in sessions first
    const sessionItem = await prisma.session.findFirst({
      where: {
        id: id,
        trainerId: trainerId,
        isActive: true,
      },
    });

    if (sessionItem) {
      return NextResponse.json(
        {
          success: true,
          type: "session",
          data: sessionItem,
        },
        { status: 200 }
      );
    }

    // If not found in sessions, try packages
    const packageItem = await prisma.package.findFirst({
      where: {
        id: id,
        trainerId: trainerId,
      },
    });

    if (packageItem) {
      return NextResponse.json(
        {
          success: true,
          type: "package",
          data: packageItem,
        },
        { status: 200 }
      );
    }

    // If not found in either
    return NextResponse.json(
      { success: false, error: "Item not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching single program:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch program",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
