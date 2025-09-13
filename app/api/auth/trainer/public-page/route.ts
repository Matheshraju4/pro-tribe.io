import { NextRequest, NextResponse } from "next/server";

import { createPublicPageFormSchema } from "@/lib/schemas/dashboard";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = { user: { id: "d8f1ba28-9fdc-4ad9-a5a4-c438ee2133d4" } };

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createPublicPageFormSchema.parse(body);

    const newPage = await prisma.publicPage.create({
      data: {
        ...validatedData,
        trainerId: session.user.id,
      },
    });

    return NextResponse.json(newPage);
  } catch (error) {
    console.error("Error creating public page:", error);
    return NextResponse.json(
      { error: "Failed to create public page" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = { user: { id: "d8f1ba28-9fdc-4ad9-a5a4-c438ee2133d4" } };

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createPublicPageFormSchema.parse(body);

    const updatedPage = await prisma.publicPage.update({
      where: {
        trainerId: session.user.id,
      },
      data: validatedData,
    });

    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error("Error updating public page:", error);
    return NextResponse.json(
      { error: "Failed to update public page" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = { user: { id: "d8f1b" } };

    const data = await prisma.publicPage.findUnique({
      where: {
        trainerId: session.user.id,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error getting public page:", error);
    return NextResponse.json(
      { error: "Failed to get public page" },
      { status: 500 }
    );
  }
}
