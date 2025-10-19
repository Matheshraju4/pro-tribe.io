import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/authtoken";

export async function GET(request: NextRequest) {
  try {
    // For demo purposes, always use the demo client
    // In a real app, you'd check authentication here
    const demoClient = await prisma.client.findFirst({
      where: { email: "demo-client@example.com" }
    });

    if (!demoClient) {
      return NextResponse.json({
        success: false,
        error: "Demo client not found. Please create dummy data first.",
        appointments: []
      });
    }

    console.log("Fetching appointments for client:", demoClient.id);

    const appointments = await prisma.appointment.findMany({
      where: { clientId: demoClient.id },
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
      orderBy: { appointmentDate: "asc" }, // Show upcoming appointments first
    });

    console.log("Found appointments:", appointments.length);

    return NextResponse.json({
      success: true,
      appointments,
      message: "Client appointments fetched successfully",
      debug: {
        clientId: demoClient.id,
        clientName: `${demoClient.firstName} ${demoClient.lastName}`,
        appointmentCount: appointments.length
      }
    });
  } catch (error) {
    console.error("Failed to fetch client appointments:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch client appointments",
        details: error instanceof Error ? error.message : "Unknown error",
        appointments: []
      },
      { status: 500 }
    );
  }
}
