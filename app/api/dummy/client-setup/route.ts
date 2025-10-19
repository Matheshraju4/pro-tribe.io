import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Create a dummy trainer first (if not exists)
    let trainer = await prisma.trainer.findFirst({
      where: { email: "demo-trainer@example.com" }
    });

    if (!trainer) {
      trainer = await prisma.trainer.create({
        data: {
          name: "Demo Trainer",
          email: "demo-trainer@example.com",
          password: "hashedpassword", // In real app, this should be properly hashed
          mobileNumber: "+1234567890",
        }
      });
    }

    // Create a dummy client
    let client = await prisma.client.findFirst({
      where: { email: "demo-client@example.com" }
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          firstName: "John",
          lastName: "Doe",
          email: "demo-client@example.com",
          phone: "+1234567891",
          trainerId: trainer.id,
        }
      });
    }

    // Create dummy sessions
    const sessions = await Promise.all([
      prisma.session.upsert({
        where: { 
          id: "personal-training-session"
        },
        update: {},
        create: {
          id: "personal-training-session",
          sessionName: "Personal Training Session",
          sessionDescription: "One-on-one personal training session",
          sessionDuration: "60",
          sessionPrice: "100.00",
          sessionType: "OneToOne",
          trainerId: trainer.id,
        }
      }),
      prisma.session.upsert({
        where: { 
          id: "nutrition-consultation"
        },
        update: {},
        create: {
          id: "nutrition-consultation",
          sessionName: "Nutrition Consultation",
          sessionDescription: "Diet and nutrition planning session",
          sessionDuration: "45",
          sessionPrice: "75.00",
          sessionType: "OneToOne",
          trainerId: trainer.id,
        }
      }),
      prisma.session.upsert({
        where: { 
          id: "group-fitness-class"
        },
        update: {},
        create: {
          id: "group-fitness-class",
          sessionName: "Group Fitness Class",
          sessionDescription: "High-intensity group workout session",
          sessionDuration: "50",
          sessionPrice: "25.00",
          sessionType: "Group",
          trainerId: trainer.id,
        }
      })
    ]);

    // Create dummy appointments for the next 30 days
    const appointments = [];
    const today = new Date();
    
    // Create appointments for different dates
    const appointmentDates = [
      new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // Day after tomorrow
      new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // Next week
      new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
    ];

    const timeSlots = [
      { start: "09:00 AM", end: "10:00 AM" },
      { start: "10:30 AM", end: "11:30 AM" },
      { start: "02:00 PM", end: "03:00 PM" },
      { start: "04:00 PM", end: "05:00 PM" },
      { start: "06:00 PM", end: "07:00 PM" },
      { start: "07:30 PM", end: "08:30 PM" },
    ];

    const statuses = ["Scheduled", "Scheduled", "Scheduled", "Completed", "Scheduled", "Cancelled"];
    const paidStatuses = ["Paid", "Unpaid", "Paid", "Paid", "Unpaid", "Unpaid"];

    for (let i = 0; i < appointmentDates.length; i++) {
      const appointmentDate = appointmentDates[i];
      const timeSlot = timeSlots[i];
      const session = sessions[i % sessions.length];
      
      // Clear any existing appointments for this client on these dates
      await prisma.appointment.deleteMany({
        where: {
          clientId: client.id,
          appointmentDate: appointmentDate,
        }
      });

      const appointment = await prisma.appointment.create({
        data: {
          appointmentName: `${session.sessionName} - ${client.firstName} ${client.lastName}`,
          appointmentDescription: `Scheduled ${session.sessionName.toLowerCase()} with ${client.firstName} ${client.lastName}`,
          appointmentDate: appointmentDate,
          startTime: timeSlot.start,
          endTime: timeSlot.end,
          appointmentLocation: "Demo Location",
          appointmentPrice: session.sessionPrice,
          appointpaidStatus: paidStatuses[i] as "Paid" | "Unpaid",
          status: statuses[i] as "Scheduled" | "Cancelled" | "Completed",
          trainerId: trainer.id,
          clientId: client.id,
          sessionId: session.id,
        },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          trainer: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          session: {
            select: {
              id: true,
              sessionName: true,
              sessionDescription: true,
            }
          }
        }
      });

      appointments.push(appointment);
    }

    return NextResponse.json({
      success: true,
      message: "Dummy client and appointments created successfully",
      data: {
        trainer: {
          id: trainer.id,
          name: trainer.name,
          email: trainer.email,
        },
        client: {
          id: client.id,
          name: `${client.firstName} ${client.lastName}`,
          email: client.email,
        },
        sessions: sessions.map(s => ({
          id: s.id,
          name: s.sessionName,
          duration: s.sessionDuration,
          price: s.sessionPrice,
        })),
        appointments: appointments.map(a => ({
          id: a.id,
          name: a.appointmentName,
          date: a.appointmentDate,
          startTime: a.startTime,
          endTime: a.endTime,
          status: a.status,
          paidStatus: a.appointpaidStatus,
          sessionName: a.session.sessionName,
        })),
      }
    });

  } catch (error) {
    console.error("Failed to create dummy client setup:", error);
    return NextResponse.json(
      { 
        error: "Failed to create dummy client setup",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the demo client info
    const client = await prisma.client.findFirst({
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

    if (!client) {
      return NextResponse.json({
        success: false,
        message: "Demo client not found. Please run POST to create dummy data."
      });
    }

    // Get appointments for the demo client
    const appointments = await prisma.appointment.findMany({
      where: { clientId: client.id },
      include: {
        session: {
          select: {
            id: true,
            sessionName: true,
            sessionDescription: true,
          }
        }
      },
      orderBy: { appointmentDate: "asc" }
    });

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: `${client.firstName} ${client.lastName}`,
        email: client.email,
        trainer: client.trainer,
      },
      appointments: appointments.map(a => ({
        id: a.id,
        name: a.appointmentName,
        date: a.appointmentDate,
        startTime: a.startTime,
        endTime: a.endTime,
        status: a.status,
        paidStatus: a.appointpaidStatus,
        sessionName: a.session.sessionName,
      }))
    });

  } catch (error) {
    console.error("Failed to fetch dummy client info:", error);
    return NextResponse.json(
      { error: "Failed to fetch dummy client info" },
      { status: 500 }
    );
  }
}
