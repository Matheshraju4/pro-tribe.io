import { getSession } from "@/lib/authtoken";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const trainerId = session.data.userId;

    const packages = await prisma.package.findMany({
      where: {
        trainerId: trainerId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        sessionPackageConnection: {
          include: {
            session: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, packages });
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}
