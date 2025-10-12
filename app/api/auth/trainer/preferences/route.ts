import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/authtoken";

// PUT - Update preferences
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { timezone, language, theme, notifications } = body;

    // Validation
    if (!timezone || !language || !theme) {
      return NextResponse.json(
        { error: "Timezone, language, and theme are required" },
        { status: 400 }
      );
    }

    if (!notifications || typeof notifications !== 'object') {
      return NextResponse.json(
        { error: "Notifications object is required" },
        { status: 400 }
      );
    }

    const { email, push, sms } = notifications;

    if (typeof email !== 'boolean' || typeof push !== 'boolean' || typeof sms !== 'boolean') {
      return NextResponse.json(
        { error: "All notification preferences must be boolean values" },
        { status: 400 }
      );
    }

    // Update trainer preferences
    const updatedTrainer = await prisma.trainer.update({
      where: {
        id: session.data.userId,
      },
      data: {
        timezone,
        language,
        theme,
        emailNotifications: email,
        pushNotifications: push,
        smsNotifications: sms,
        updatedAt: new Date(),
      },
    });

    // Remove sensitive data
    const { password, ...trainerData } = updatedTrainer;

    return NextResponse.json(
      { 
        message: "Preferences updated successfully", 
        preferences: {
          timezone: trainerData.timezone,
          language: trainerData.language,
          theme: trainerData.theme,
          notifications: {
            email: trainerData.emailNotifications,
            push: trainerData.pushNotifications,
            sms: trainerData.smsNotifications,
          }
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
