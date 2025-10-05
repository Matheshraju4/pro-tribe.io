import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/authtoken";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessions = await prisma.session.findMany({
      where: {
        trainerId: session.data.userId,
        isActive: true,
      },
      select: {
        id: true,
        sessionName: true,
        sessionDescription: true,
        sessionDuration: true,
        sessionPrice: true,
        sessionType: true,
      },
      orderBy: { sessionName: "asc" },
    });

    return NextResponse.json({
      success: true,
      sessions,
      message: "Sessions fetched successfully",
    });
  } catch (error) {
    console.error("Failed to fetch sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}
