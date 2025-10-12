import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/authtoken";

// GET - Fetch trainer's discounts
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const discounts = await prisma.discount.findMany({
      where: {
        trainerId: session.data.userId,
      },
      include: {
        discountPackageConnection: {
          include: {
            package: {
              select: {
                id: true,
                packageName: true,
                packagePrice: true,
              },
            },
          },
        },
        discountSessionConnection: {
          include: {
            session: {
              select: {
                id: true,
                sessionName: true,
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

    return NextResponse.json({ discounts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching discounts:", error);
    return NextResponse.json(
      { error: "Failed to fetch discounts" },
      { status: 500 }
    );
  }
}

// POST - Create new discount
export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      code,
      name,
      description,
      type,
      value,
      startDate,
      endDate,
      usageLimit,
      minAmount,
      isActive,
      applyToAll,
      selectedPackages,
      selectedSessions,
    } = body;

    // Validation
    if (!code || !name || !type || !value || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingDiscount = await prisma.discount.findUnique({
      where: { code },
    });

    if (existingDiscount) {
      return NextResponse.json(
        { error: "Discount code already exists" },
        { status: 400 }
      );
    }

    // Validate date range
    if (new Date(startDate) >= new Date(endDate)) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 }
      );
    }

    // Create discount
    const discount = await prisma.discount.create({
      data: {
        code,
        name,
        description,
        type,
        value,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        minAmount: minAmount || null,
        isActive: isActive || false,
        trainerId: session.data.userId,
      },
    });

    // Create connections if not applying to all
    if (!applyToAll) {
      // Package connections
      if (selectedPackages && selectedPackages.length > 0) {
        await prisma.discountPackageConnection.createMany({
          data: selectedPackages.map((packageId: string) => ({
            discountId: discount.id,
            packageId,
          })),
        });
      }

      // Session connections
      if (selectedSessions && selectedSessions.length > 0) {
        await prisma.discountSessionConnection.createMany({
          data: selectedSessions.map((sessionId: string) => ({
            discountId: discount.id,
            sessionId,
          })),
        });
      }
    }

    // Fetch the created discount with connections
    const createdDiscount = await prisma.discount.findUnique({
      where: { id: discount.id },
      include: {
        discountPackageConnection: {
          include: {
            package: true,
          },
        },
        discountSessionConnection: {
          include: {
            session: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Discount created successfully", discount: createdDiscount },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating discount:", error);
    return NextResponse.json(
      { error: "Failed to create discount" },
      { status: 500 }
    );
  }
}

// PUT - Update discount
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      discountId,
      code,
      name,
      description,
      type,
      value,
      startDate,
      endDate,
      usageLimit,
      minAmount,
      isActive,
      applyToAll,
      selectedPackages,
      selectedSessions,
    } = body;

    if (!discountId) {
      return NextResponse.json(
        { error: "Discount ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingDiscount = await prisma.discount.findFirst({
      where: {
        id: discountId,
        trainerId: session.data.userId,
      },
    });

    if (!existingDiscount) {
      return NextResponse.json(
        { error: "Discount not found" },
        { status: 404 }
      );
    }

    // Check if code already exists (excluding current discount)
    if (code !== existingDiscount.code) {
      const codeExists = await prisma.discount.findUnique({
        where: { code },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: "Discount code already exists" },
          { status: 400 }
        );
      }
    }

    // Delete existing connections
    await prisma.discountPackageConnection.deleteMany({
      where: { discountId },
    });
    await prisma.discountSessionConnection.deleteMany({
      where: { discountId },
    });

    // Update discount
    const updatedDiscount = await prisma.discount.update({
      where: { id: discountId },
      data: {
        code,
        name,
        description,
        type,
        value,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        minAmount: minAmount || null,
        isActive: isActive || false,
      },
    });

    // Create new connections if not applying to all
    if (!applyToAll) {
      // Package connections
      if (selectedPackages && selectedPackages.length > 0) {
        await prisma.discountPackageConnection.createMany({
          data: selectedPackages.map((packageId: string) => ({
            discountId: updatedDiscount.id,
            packageId,
          })),
        });
      }

      // Session connections
      if (selectedSessions && selectedSessions.length > 0) {
        await prisma.discountSessionConnection.createMany({
          data: selectedSessions.map((sessionId: string) => ({
            discountId: updatedDiscount.id,
            sessionId,
          })),
        });
      }
    }

    return NextResponse.json(
      { message: "Discount updated successfully", discount: updatedDiscount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating discount:", error);
    return NextResponse.json(
      { error: "Failed to update discount" },
      { status: 500 }
    );
  }
}

// DELETE - Delete discount
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const discountId = searchParams.get("id");

    if (!discountId) {
      return NextResponse.json(
        { error: "Discount ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const discount = await prisma.discount.findFirst({
      where: {
        id: discountId,
        trainerId: session.data.userId,
      },
    });

    if (!discount) {
      return NextResponse.json(
        { error: "Discount not found" },
        { status: 404 }
      );
    }

    // Delete discount (cascade will delete connections)
    await prisma.discount.delete({
      where: { id: discountId },
    });

    return NextResponse.json(
      { message: "Discount deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting discount:", error);
    return NextResponse.json(
      { error: "Failed to delete discount" },
      { status: 500 }
    );
  }
}
