import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/authtoken";

// PUT - Update business details
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      businessName,
      businessAddress,
      businessPhone,
      businessEmail,
      businessWebsite,
      businessDescription,
    } = body;

    // Validation
    if (!businessName) {
      return NextResponse.json(
        { error: "Business name is required" },
        { status: 400 }
      );
    }

    // Check if trainer already has business details
    const existingBusiness = await prisma.businessDetails.findFirst({
      where: {
        trainerId: session.data.userId,
      },
    });

    let businessDetails;

    if (existingBusiness) {
      // Update existing business details
      businessDetails = await prisma.businessDetails.update({
        where: {
          id: existingBusiness.id,
        },
        data: {
          businessName,
          businessAddress: businessAddress || null,
          businessPhone: businessPhone || null,
          businessEmail: businessEmail || null,
          businessWebsite: businessWebsite || null,
          businessDescription: businessDescription || null,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new business details
      businessDetails = await prisma.businessDetails.create({
        data: {
          trainerId: session.data.userId,
          businessName,
          businessAddress: businessAddress || null,
          businessPhone: businessPhone || null,
          businessEmail: businessEmail || null,
          businessWebsite: businessWebsite || null,
          businessDescription: businessDescription || null,
        },
      });
    }

    return NextResponse.json(
      { 
        message: "Business details updated successfully", 
        businessDetails 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating business details:", error);
    return NextResponse.json(
      { error: "Failed to update business details" },
      { status: 500 }
    );
  }
}
