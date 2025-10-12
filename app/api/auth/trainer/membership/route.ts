import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/authtoken";

// GET - Fetch trainer's memberships
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberships = await prisma.membership.findMany({
      where: {
        trainerId: session.data.userId,
      },
      include: {
        membershipSessionConnection: {
          include: {
            session: {
              select: {
                id: true,
                sessionName: true,
                sessionDescription: true,
                sessionPrice: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ memberships }, { status: 200 });
  } catch (error) {
    console.error("Error fetching memberships:", error);
    return NextResponse.json(
      { error: "Failed to fetch memberships" },
      { status: 500 }
    );
  }
}

// POST - Create new membership
export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      membershipName,
      membershipDescription,
      selectedSessions,
      billingPeriod,
      weeklyPrice,
      monthlyPrice,
      yearlyPrice,
      autoRenewal,
      visibility,
    } = body;

    // Validation
    if (!membershipName || !membershipName.trim()) {
      return NextResponse.json(
        { error: "Membership name is required" },
        { status: 400 }
      );
    }

    if (!selectedSessions || selectedSessions.length === 0) {
      return NextResponse.json(
        { error: "At least one session must be selected" },
        { status: 400 }
      );
    }

    if (!["Weekly", "Monthly", "Yearly"].includes(billingPeriod)) {
      return NextResponse.json(
        { error: "Invalid billing period" },
        { status: 400 }
      );
    }

    // Create membership with session connections
    const membership = await prisma.membership.create({
      data: {
        membershipName,
        membershipDescription,
        billingPeriod,
        weeklyPrice,
        monthlyPrice,
        yearlyPrice,
        autoRenewal: autoRenewal || false,
        visibility: visibility || "Private",
        trainerId: session.data.userId,
        membershipSessionConnection: {
          create: selectedSessions.map((sessionId: string) => ({
            sessionId,
          })),
        },
      },
      include: {
        membershipSessionConnection: {
          include: {
            session: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Membership created successfully", membership },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating membership:", error);
    return NextResponse.json(
      { error: "Failed to create membership" },
      { status: 500 }
    );
  }
}

// PUT - Update membership
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      membershipId,
      membershipName,
      membershipDescription,
      selectedSessions,
      billingPeriod,
      weeklyPrice,
      monthlyPrice,
      yearlyPrice,
      autoRenewal,
      visibility,
    } = body;

    if (!membershipId) {
      return NextResponse.json(
        { error: "Membership ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingMembership = await prisma.membership.findFirst({
      where: {
        id: membershipId,
        trainerId: session.data.userId,
      },
    });

    if (!existingMembership) {
      return NextResponse.json(
        { error: "Membership not found" },
        { status: 404 }
      );
    }

    // Delete existing session connections
    await prisma.membershipSessionConnection.deleteMany({
      where: { membershipId },
    });

    // Update membership
    const membership = await prisma.membership.update({
      where: { id: membershipId },
      data: {
        membershipName,
        membershipDescription,
        billingPeriod,
        weeklyPrice,
        monthlyPrice,
        yearlyPrice,
        autoRenewal,
        visibility,
        membershipSessionConnection: {
          create: selectedSessions.map((sessionId: string) => ({
            sessionId,
          })),
        },
      },
      include: {
        membershipSessionConnection: {
          include: {
            session: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Membership updated successfully", membership },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating membership:", error);
    return NextResponse.json(
      { error: "Failed to update membership" },
      { status: 500 }
    );
  }
}

// DELETE - Delete membership
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const membershipId = searchParams.get("id");

    if (!membershipId) {
      return NextResponse.json(
        { error: "Membership ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const membership = await prisma.membership.findFirst({
      where: {
        id: membershipId,
        trainerId: session.data.userId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Membership not found" },
        { status: 404 }
      );
    }

    // Delete membership (cascade will delete connections)
    await prisma.membership.delete({
      where: { id: membershipId },
    });

    return NextResponse.json(
      { message: "Membership deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting membership:", error);
    return NextResponse.json(
      { error: "Failed to delete membership" },
      { status: 500 }
    );
  }
}

