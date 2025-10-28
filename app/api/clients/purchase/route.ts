import { getClientSession } from "@/lib/authtoken";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Authenticate client
    const session = await getClientSession(request);
    if (!session || !session.data.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    const clientId = session.data.userId;
    const trainerId = session.data.trainerId;

    // Get request body
    const body = await request.json();
    const { itemId, itemType } = body;

    if (!itemId || !itemType) {
      return NextResponse.json(
        { success: false, error: "Item ID and type are required" },
        { status: 400 }
      );
    }

    // Validate itemType
    if (itemType !== "session" && itemType !== "package") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid item type. Must be 'session' or 'package'",
        },
        { status: 400 }
      );
    }

    let itemData: any = null;
    let itemName = "";
    let itemDescription = "";
    let price = "0";
    let sessionsTotal: number | null = null;
    let validDays: string | null = null;

    // Fetch item details based on type
    if (itemType === "session") {
      const session = await prisma.session.findFirst({
        where: {
          id: itemId,
          trainerId: trainerId,
          isActive: true,
        },
      });

      if (!session) {
        return NextResponse.json(
          { success: false, error: "Session not found or inactive" },
          { status: 404 }
        );
      }

      itemData = session;
      itemName = session.sessionName;
      itemDescription = session.sessionDescription || "";
      price = session.sessionPrice || "0";
      sessionsTotal = 1; // Single session
    } else {
      const packageItem = await prisma.package.findFirst({
        where: {
          id: itemId,
          trainerId: trainerId,
        },
      });

      if (!packageItem) {
        return NextResponse.json(
          { success: false, error: "Package not found" },
          { status: 404 }
        );
      }

      itemData = packageItem;
      itemName = packageItem.packageName;
      itemDescription = packageItem.packageDescription || "";
      price = packageItem.packagePrice || "0";
      validDays = packageItem.validDays;

      // Get session count from package connections
      const sessionConnections = await prisma.sessionPackageConnection.findMany(
        {
          where: { packageId: itemId },
        }
      );
      sessionsTotal = sessionConnections.length;
    }

    // Calculate validity period for packages
    let validUntil: Date | null = null;
    if (itemType === "package" && validDays) {
      const days = parseInt(validDays);
      if (!isNaN(days)) {
        validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + days);
      }
    }

    // Create purchase record
    const purchase = await prisma.purchase.create({
      data: {
        clientId: clientId,
        trainerId: trainerId,
        itemType: itemType === "session" ? "Session" : "Package",
        itemId: itemId,
        itemName: itemName,
        itemDescription: itemDescription,
        originalPrice: price,
        finalPrice: price,
        paymentStatus: "Paid", // Assuming immediate payment for now
        paymentMethod: "Card", // Default payment method
        transactionId: `TXN-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        status: "Active",
        validUntil: validUntil,
        sessionsTotal: sessionsTotal,
        sessionsUsed: 0,
        sessionsRemaining: sessionsTotal,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `${
          itemType === "session" ? "Session" : "Package"
        } purchased successfully`,
        purchase: {
          id: purchase.id,
          itemName: purchase.itemName,
          itemType: purchase.itemType,
          finalPrice: purchase.finalPrice,
          transactionId: purchase.transactionId,
          purchaseDate: purchase.purchaseDate,
          validUntil: purchase.validUntil,
          sessionsRemaining: purchase.sessionsRemaining,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Purchase error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process purchase",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch client's purchases
export async function GET(request: NextRequest) {
  try {
    // Authenticate client
    const session = await getClientSession(request);
    if (!session || !session.data.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    const clientId = session.data.userId;

    // Fetch all purchases for the client
    const purchases = await prisma.purchase.findMany({
      where: { clientId },
      orderBy: { purchaseDate: "desc" },
    });

    return NextResponse.json(
      {
        success: true,
        purchases,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch purchases",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

