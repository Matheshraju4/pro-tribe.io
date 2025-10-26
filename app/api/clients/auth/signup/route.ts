import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { generateToken } from "@/lib/authtoken";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import VerifyEmailTemplate from "@/components/modules/general/email-templates/verify-email";

// Schema for client signup validation
const clientSignupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  trainerUrl: z.string().min(1, "Trainer URL is required"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("body", JSON.stringify(body, null, 2));

    // Validate the request body
    const validatedData = clientSignupSchema.parse(body);

    // Find the trainer by their unique URL
    const trainer = await prisma.publicPage.findUnique({
      where: { uniqueUrl: validatedData.trainerUrl },
      include: { trainer: true },
    });

    if (!trainer) {
      return NextResponse.json(
        { error: "Invalid trainer link. Please check the URL." },
        { status: 404 }
      );
    }

    // Check if client already exists
    const existingClient = await prisma.client.findUnique({
      where: { email: validatedData.email },
    });

    if (existingClient) {
      return NextResponse.json(
        { error: "A client with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await hash(validatedData.password, 12);

    // Create the client
    const client = await prisma.client.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone || null,
        password: hashedPassword,
        trainerId: trainer.trainerId,
      },
    });

    const clientToken = await generateToken(
      {
        role: "Client",
        email: client.email,
        userId: client.id,
      },
      "1d"
    );

    const verificationToken = `${
      process.env.APPLICATION_BASIC_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000"
    }/verify-email?token=${clientToken}`;
    const { data, error } = await sendEmail(
      client.email,
      "Verify Your Email - ProTribe",
      VerifyEmailTemplate({
        firstName: client.firstName,
        verificationLink: verificationToken,
        trainerName: trainer.trainer.name,
      })
    );

    console.log("data", JSON.stringify(data, null, 2));
    if (error) {
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "verification email sent", client },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log("Validation error:", error.message);
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 400 }
      );
    }

    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
