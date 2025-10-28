import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/authtoken";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const cookieStore = await cookies();
    const authToken = cookieStore.get("proTribe-client-authToken");

    if (!authToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Please login." },
        { status: 401 }
      );
    }

    // Verify the token
    const verified = await verifyToken(authToken.value);
    if (!verified || !verified.data.email) {
      return NextResponse.json(
        { success: false, error: "Invalid authentication token." },
        { status: 401 }
      );
    }

    // Get client data
    const client = await prisma.client.findUnique({
      where: { email: verified.data.email },
      include: {
        trainer: {
          select: {
            id: true,
            name: true,
            email: true,
            mobileNumber: true,
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: "Client not found." },
        { status: 404 }
      );
    }

    // Get upcoming appointments (future appointments only)
    const now = new Date();
    const upcomingAppointments = await prisma.appointment.findMany({
      where: {
        clientId: client.id,
        appointmentDate: {
          gte: now,
        },
        status: {
          not: "Cancelled",
        },
      },
      include: {
        session: {
          select: {
            id: true,
            sessionName: true,
            sessionDescription: true,
          },
        },
        trainer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        appointmentDate: "asc",
      },
      take: 5, // Get next 5 appointments
    });

    // Get all appointments for activity history
    const allAppointments = await prisma.appointment.findMany({
      where: {
        clientId: client.id,
      },
      include: {
        session: {
          select: {
            sessionName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    // Get packages/services purchased by the client
    // Note: This assumes you have a Package or ClientPackage model
    // If not, we'll create a placeholder structure
    const services = [
      {
        id: "1",
        name: "Session Package",
        description: `${upcomingAppointments.length} sessions scheduled`,
        progress: upcomingAppointments.length > 0 ? 70 : 0,
        totalSessions: allAppointments.length,
        completedSessions: allAppointments.filter(
          (a) => a.status === "Completed"
        ).length,
      },
    ];

    // Create activity history from appointments
    const activities = allAppointments.map((appointment) => {
      const timeDiff =
        now.getTime() - new Date(appointment.createdAt || now).getTime();
      const daysAgo = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      let timeAgo = "";
      if (daysAgo === 0) {
        timeAgo = "Today";
      } else if (daysAgo === 1) {
        timeAgo = "Yesterday";
      } else if (daysAgo < 7) {
        timeAgo = `${daysAgo} days ago`;
      } else if (daysAgo < 14) {
        timeAgo = "1 week ago";
      } else if (daysAgo < 21) {
        timeAgo = "2 weeks ago";
      } else if (daysAgo < 30) {
        timeAgo = "3 weeks ago";
      } else {
        timeAgo = `${Math.floor(daysAgo / 30)} months ago`;
      }

      let type = "scheduled";
      let message = "";

      if (appointment.status === "Completed") {
        type = "completed";
        message = `Completed: ${
          appointment.session?.sessionName || "Session"
        } on ${new Date(
          appointment.appointmentDate || now
        ).toLocaleDateString()}`;
      } else if (appointment.status === "Cancelled") {
        type = "cancelled";
        message = `Cancelled: ${
          appointment.session?.sessionName || "Session"
        } on ${new Date(
          appointment.appointmentDate || now
        ).toLocaleDateString()}`;
      } else {
        type = "scheduled";
        message = `Scheduled: ${
          appointment.session?.sessionName || "Session"
        } on ${new Date(
          appointment.appointmentDate || now
        ).toLocaleDateString()}`;
      }

      return {
        id: appointment.id,
        type,
        message,
        time: timeAgo,
        date: appointment.createdAt,
      };
    });

    // Format upcoming appointments
    const formattedAppointments = upcomingAppointments.map((appointment) => {
      const appointmentDate = new Date(appointment.appointmentDate || now);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      let dateString = "";
      if (appointmentDate.toDateString() === today.toDateString()) {
        dateString = `Today, ${appointment.startTime}`;
      } else if (appointmentDate.toDateString() === tomorrow.toDateString()) {
        dateString = `Tomorrow, ${appointment.startTime}`;
      } else {
        dateString = `${appointmentDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        })}, ${appointment.startTime}`;
      }

      return {
        id: appointment.id,
        title: appointment.session?.sessionName || appointment.appointmentName,
        trainer: appointment.trainer.name,
        date: dateString,
        status: appointment.status,
        paidStatus: appointment.appointpaidStatus,
        location: appointment.appointmentLocation,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        client: {
          id: client.id,
          name: `${client.firstName} ${client.lastName}`,
          email: client.email,
          phone: client.phone,
        },
        trainer: client.trainer,
        upcomingAppointments: formattedAppointments,
        services,
        activities,
        stats: {
          totalAppointments: allAppointments.length,
          completedAppointments: allAppointments.filter(
            (a) => a.status === "Completed"
          ).length,
          upcomingAppointments: upcomingAppointments.length,
          cancelledAppointments: allAppointments.filter(
            (a) => a.status === "Cancelled"
          ).length,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch dashboard data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
