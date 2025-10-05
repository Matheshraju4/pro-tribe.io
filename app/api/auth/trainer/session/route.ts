import { getSession } from "@/lib/authtoken";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const trainerId = session.data.userId;

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

export async function PUT(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const trainerId = session.data.userId;

  try {
    const body = await request.json();
    const sessionId = body.sessionId;
    const isActive = body.isActive;
    const updatedSession = await prisma.session.update({
      where: {
        trainerId: trainerId,
        id: sessionId,
      },
      data: {
        isActive: isActive,
      },
    });
    return NextResponse.json({
      success: true,
      updatedSession,
      message: "Session Freezed successfully",
    });
  } catch (error) {
    console.error("Error freezing session:", error);
    return NextResponse.json(
      { message: "Failed to freeze session" },
      { status: 500 }
    );
  }
}
