import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const trainerId = "d8f1ba28-9fdc-4ad9-a5a4-c438ee2133d4";

  try {
    const sessions = await prisma.session.findMany({
      where: {
        trainerId: trainerId,
      },
      include: {
        sessionTag: true,
        sessionDateAndTime: true,
      },
    });

    return NextResponse.json({
      success: true,
      sessions,
      message: "Session data fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch sessions",
      },
      { status: 500 }
    );
  }
}
