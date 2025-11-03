import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getClientSession } from "@/lib/authtoken";
import { z } from "zod";

// Schema for client appointment booking
const clientAppointmentSchema = z.object({
  appointmentName: z.string().min(1, "Appointment name is required"),
  appointmentDescription: z.string().optional(),
  appointmentDate: z.string().transform((str) => new Date(str)),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(), // Calculate from start time + 1 hour if not provided
  appointmentLocation: z.string().default("Online"),
  appointmentPrice: z.string().optional(),
  sessionId: z.string().optional(),
  paymentMethod: z.enum(["cash", "stripe"]),
});

export async function POST(request: NextRequest) {
  try {
    // Get client session
    const session = await getClientSession(request);
    if (!session || !session.data.userId || !session.data.trainerId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login as a client." },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("Received Client Appointment Booking:", body);

    // Validate the request body
    const validatedData = clientAppointmentSchema.parse(body);

    // Calculate end time if not provided (default to 1 hour after start time)
    let endTime = validatedData.endTime;
    if (!endTime) {
      const [time, period] = validatedData.startTime.split(" ");
      const [hours, minutes] = time.split(":").map(Number);
      let endHours = hours + 1;
      if (endHours > 12) endHours = endHours - 12;
      endTime = `${endHours}:${minutes.toString().padStart(2, "0")} ${period}`;
    }

    // Determine payment status based on payment method
    const paidStatus =
      validatedData.paymentMethod === "cash" ? "Unpaid" : "Paid";

    // Create the appointment in the database
    const appointment = await prisma.appointment.create({
      data: {
        appointmentName: validatedData.appointmentName,
        appointmentDescription: validatedData.appointmentDescription,
        appointmentDate: validatedData.appointmentDate,
        startTime: validatedData.startTime,
        endTime: endTime,
        appointmentLocation: validatedData.appointmentLocation,
        appointmentPrice: validatedData.appointmentPrice || "0",
        appointpaidStatus: paidStatus,
        status: "Scheduled",
        trainerId: session.data.trainerId,
        clientId: session.data.userId,
        sessionId: validatedData.sessionId || null,
      },
      include: {
        trainer: {
          select: {
            id: true,
            name: true,
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

    console.log("Client appointment created successfully:", appointment);

    return NextResponse.json(
      {
        success: true,
        appointment,
        message: "Appointment booked successfully!",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create client appointment:", error);

    // Handle validation errors
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create appointment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
