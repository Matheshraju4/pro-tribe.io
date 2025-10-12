import { NextRequest, NextResponse } from "next/server";
import { createPublicPageFormSchema } from "@/lib/schemas/dashboard";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/authtoken";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createPublicPageFormSchema.parse(body);

    const newPage = await prisma.publicPage.create({
      data: {
        ...validatedData,
        trainerId: session.data.userId,
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
    const session = await getSession(req);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createPublicPageFormSchema.parse(body);

    const updatedPage = await prisma.publicPage.update({
      where: {
        trainerId: session.data.userId,
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
    const session = await getSession(req);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await prisma.publicPage.findUnique({
      where: {
        trainerId: session.data.userId,
      },
      include: {
        trainer: {
          select: {
            name: true,
            email: true,
            mobileNumber: true,
          }
        }
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
