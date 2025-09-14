import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = { user: { id: "d8f1ba28-9fdc-4ad9-a5a4-c438ee2133d4" } };
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const client = await prisma.client.create({
      data: {
        ...data,
        trainerId: session.user.id, // Assuming you have the trainer's ID in the session
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("Failed to create client:", error);
    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
