import { getSession, verifyToken } from "@/lib/authtoken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getSession(request);

  if (!session) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      { status: 401 }
    );
  }

  console.log("Session", session.data.email);
  const tags = await prisma.tag.findMany({
    where: {
      sessionId: session.data.email,
    },
  });

  console.log("Is Verified", session);

  return NextResponse.json({
    message: "Session fetched successfully",
    session: session,
  });
}
