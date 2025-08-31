import { NextRequest, NextResponse } from "next/server";
import { trainerSignupBackendSchema } from "@/lib/schemas/auth";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body using the shared schema
    const validatedData = trainerSignupBackendSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.trainer.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(validatedData.password, 12);

    // Create the trainer
    const trainer = await prisma.trainer.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        mobileNumber: validatedData.mobileNumber,
        businessDetails: {
          create: {
            businessName: validatedData.businessName,
          },
        },
      },
    });

    // Remove password from response
    const { password, ...trainerWithoutPassword } = trainer;

    return NextResponse.json(
      {
        message: "Trainer created successfully",
        trainer: trainerWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log(error);
      return NextResponse.json(
        { message: "Validation failed" },
        { status: 400 }
      );
    }

    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
