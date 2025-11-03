import { getClientSession } from "@/lib/authtoken";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const uniqueUrl = request.nextUrl.searchParams.get("uniqueUrl");
    let trainerId: string | null = null;

    if (uniqueUrl) {
      // Public access via uniqueUrl
      const publicPage = await prisma.publicPage.findUnique({
        where: { uniqueUrl },
        select: { trainerId: true },
      });

      if (!publicPage) {
        return NextResponse.json(
          { success: false, error: "Trainer not found with this URL" },
          { status: 404 }
        );
      }

      trainerId = publicPage.trainerId;
    } else {
      // Authenticated client access
      const session = await getClientSession(request);
      if (!session || !session.data.trainerId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized. Please login." },
          { status: 401 }
        );
      }
      trainerId = session.data.trainerId;
    }

    // Fetch packages, sessions, and memberships for the trainer
    const [packages, sessions, memberships] = await Promise.all([
      prisma.package.findMany({
        where: { trainerId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.session.findMany({
        where: { trainerId, isActive: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.membership.findMany({
        where: { trainerId, isActive: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        packages,
        sessions,
        memberships,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch programs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
