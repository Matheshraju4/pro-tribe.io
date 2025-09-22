import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import { createSessionBackendSchema } from "@/lib/schemas/dashboard";
import { getSession } from "@/lib/authtoken";

export async function POST(req: NextRequest) {
  try {
    // Read the request body once and store it
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const trainerId = session.data.userId;
    const body = await req.json();
    console.log("Received Data", body);

    // Use the stored body data for validation
    const validatedData = createSessionBackendSchema.parse(body);
    console.log("Validated Data", validatedData);

    const response = await prisma.session.create({
      data: {
        sessionName: validatedData.sessionName,
        sessionDescription: validatedData.sessionDescription,
        sessionDuration: validatedData.sessionDuration,
        sessionLocation: validatedData.sessionLocation,
        sessionType: validatedData.sessionType,
        sessionMaxCapacity: validatedData.sessionMaxCapacity,
        sessionFrequency: validatedData.sessionFrequency,
        bufferTime: validatedData.bufferTime,
        sessionPrice: validatedData.sessionPrice,
        sessionValidity:
          validatedData.sessionFrequency === "OneTime"
            ? validatedData.sessionDate
            : validatedData.sessionEndDate,
        sessionDate: validatedData.sessionDate,
        sessionStartDate: validatedData.sessionStartDate,
        sessionEndDate: validatedData.sessionEndDate,
        sessionDateAndTime: {
          create: validatedData.sessionDateAndTime,
        },
        trainerId: trainerId,
      },
    });

    console.log("Response", response);

    return NextResponse.json(
      { message: "Session created successfully", data: validatedData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating session:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          message: "Validation failed",
          errors: error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
