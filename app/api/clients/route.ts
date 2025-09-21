import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // TODO: Replace with actual session/auth logic
    const session = { user: { id: "d8f1ba28-9fdc-4ad9-a5a4-c438ee2133d4" } };

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    console.log("Received Data", data);

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email) {
      return NextResponse.json(
        { error: "First name, last name, and email are required" },
        { status: 400 }
      );
    }

    // Create the client in the database
    const client = await prisma.client.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        address: data.address || null,
        city: data.city || null,
        postcode: data.postcode || null,
        country: data.country || null,
        tags: data.tags || [],
        trainerId: session.user.id,
      },
    });

    console.log("Client created successfully:", client);

    return NextResponse.json(
      {
        message: "Client created successfully",
        client: client,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Failed to create client:", error);
    
    // Handle unique constraint violation (duplicate email)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "A client with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
