import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createPackageBackendSchema } from "@/lib/schemas/package";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received Data", body);

    // Validate the request body
    const validatedData = createPackageBackendSchema.parse(body);

    // Create the package in the database
    const packages = await prisma.package.create({
      data: {
        packageName: validatedData.packageName,
        packageDescription: validatedData.packageDescription,
        packagePrice: validatedData.packagePrice,
        packageDiscount: validatedData.packageDiscount || null,
        validDays: validatedData.validDays,
        sessionPackageConnection: {
          create: validatedData.selectedSession.map((session: string) => ({
            sessionId: session,
          })),
        },
      },
    });

    console.log("Created Package", packages);
    return NextResponse.json(
      {
        success: true,
        packages,
        message: "Package created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating package:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid form data",
          errors: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, packages });
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}
