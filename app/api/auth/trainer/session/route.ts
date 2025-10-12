import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/authtoken";

// GET - Fetch trainer session data
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trainer = await prisma.trainer.findUnique({
      where: {
        id: session.data.userId,
      },
      include: {
        businessDetails: true,
        publicPage: true,
      },
    });

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 });
    }

    // Remove sensitive data
    const { password, ...trainerData } = trainer;

    return NextResponse.json({ trainer: trainerData }, { status: 200 });
  } catch (error) {
    console.error("Error fetching trainer session:", error);
    return NextResponse.json(
      { error: "Failed to fetch trainer data" },
      { status: 500 }
    );
  }
}