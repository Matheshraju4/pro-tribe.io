import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/authtoken";

// PUT - Update trainer profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, mobileNumber, age, gender } = body;

    // Validation
    if (!name || !email || !mobileNumber) {
      return NextResponse.json(
        { error: "Name, email, and mobile number are required" },
        { status: 400 }
      );
    }

    // Check if email is already taken by another trainer
    const existingTrainer = await prisma.trainer.findFirst({
      where: {
        email: email,
        id: { not: session.data.userId },
      },
    });

    if (existingTrainer) {
      return NextResponse.json(
        { error: "Email is already taken by another trainer" },
        { status: 400 }
      );
    }

    // Update trainer profile
    const updatedTrainer = await prisma.trainer.update({
      where: {
        id: session.data.userId,
      },
      data: {
        name,
        email,
        mobileNumber,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        updatedAt: new Date(),
      },
    });

    // Remove sensitive data
    const { password, ...trainerData } = updatedTrainer;

    return NextResponse.json(
      { 
        message: "Profile updated successfully", 
        trainer: trainerData 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating trainer profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
