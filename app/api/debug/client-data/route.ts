import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get demo client
    const demoClient = await prisma.client.findFirst({
      where: { email: "demo-client@example.com" },
      include: {
        trainer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    // Get demo trainer
    const demoTrainer = await prisma.trainer.findFirst({
      where: { email: "demo-trainer@example.com" }
    });

    // Get all sessions for the trainer
    const sessions = await prisma.session.findMany({
      where: { trainerId: demoTrainer?.id },
      orderBy: { sessionName: "asc" }
    });

    // Get all appointments for the client
    const appointments = await prisma.appointment.findMany({
      where: { clientId: demoClient?.id },
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
      orderBy: { appointmentDate: "asc" }
    });

    return NextResponse.json({
      success: true,
      debug: {
        demoClient: demoClient ? {
          id: demoClient.id,
          name: `${demoClient.firstName} ${demoClient.lastName}`,
          email: demoClient.email,
          trainer: demoClient.trainer
        } : null,
        demoTrainer: demoTrainer ? {
          id: demoTrainer.id,
          name: demoTrainer.name,
          email: demoTrainer.email
        } : null,
        sessions: sessions.map(s => ({
          id: s.id,
          name: s.sessionName,
          duration: s.sessionDuration,
          price: s.sessionPrice,
          type: s.sessionType
        })),
        appointments: appointments.map(a => ({
          id: a.id,
          name: a.appointmentName,
          date: a.appointmentDate,
          startTime: a.startTime,
          endTime: a.endTime,
          status: a.status,
          paidStatus: a.appointpaidStatus,
          sessionName: a.session?.sessionName,
          trainerName: a.trainer?.name
        })),
        counts: {
          clients: await prisma.client.count(),
          trainers: await prisma.trainer.count(),
          sessions: await prisma.session.count(),
          appointments: await prisma.appointment.count(),
          clientAppointments: appointments.length
        }
      }
    });

  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { 
        error: "Debug failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
