import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/authtoken";
import { createAppointmentBackendSchema } from "@/lib/schemas/appointment";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Received Appointment Data", body);

    // Validate the request body
    const validatedData = createAppointmentBackendSchema.parse(body);

    // Create the appointment in the database
    const appointment = await prisma.appointment.create({
      data: {
        appointmentName: validatedData.appointmentName,
        appointmentDescription: validatedData.appointmentDescription,
        appointmentDate: validatedData.appointmentDate,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        appointmentLocation: validatedData.appointmentLocation,
        appointmentPrice: validatedData.appointmentPrice,
        appointpaidStatus: validatedData.appointpaidStatus,
        status: validatedData.status,
        trainerId: session.data.userId,
        clientId: validatedData.clientId,
        sessionId: validatedData.sessionId || null,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        session: {
          select: {
            id: true,
            sessionName: true,
            sessionDescription: true,
          },
        },
      },
    });

    console.log("Appointment created successfully:", appointment);

    return NextResponse.json(
      {
        success: true,
        appointment,
        message: "Appointment created successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create appointment:", error);

    // Handle validation errors
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appointments = await prisma.appointment.findMany({
      where: { trainerId: session.data.userId },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        session: {
          select: {
            id: true,
            sessionName: true,
            sessionDescription: true,
          },
        },
      },
      orderBy: { appointmentDate: "desc" },
    });

    return NextResponse.json({
      success: true,
      appointments,
      message: "Appointments fetched successfully",
    });
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
