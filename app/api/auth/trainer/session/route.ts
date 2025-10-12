import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/authtoken";

// GET - Fetch trainer sessions data
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch sessions with their tags
    const sessions = await prisma.session.findMany({
      where: {
        trainerId: session.data.userId,
        isActive: true,
      },
      include: {
        sessionTag: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch all tags for the trainer
    const sessionTags = await prisma.tag.findMany({
      where: {
        sessionId: session.data.userId,
      },
    });

    return NextResponse.json({ 
      sessions: sessions,
      sessionTags: sessionTags
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching trainer sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch sessions data" },
      { status: 500 }
    );
  }
}