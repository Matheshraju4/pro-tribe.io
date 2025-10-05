import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/authtoken";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all clients for the authenticated trainer
    const clients = await prisma.client.findMany({
      where: { trainerId: session.data.userId },
      orderBy: { createdAt: "desc" },
    });

    // Define CSV headers
    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Company",
      "Address",
      "City",
      "Postcode",
      "Country",
      "Tags",
      "Created Date",
    ];

    // Convert clients data to CSV format
    const csvRows = [
      headers.join(","), // Header row
      ...clients.map((client) =>
        [
          `"${client.firstName || ""}"`,
          `"${client.lastName || ""}"`,
          `"${client.email || ""}"`,
          `"${client.phone || ""}"`,
          `"${client.company || ""}"`,
          `"${client.address || ""}"`,
          `"${client.city || ""}"`,
          `"${client.postcode || ""}"`,
          `"${client.country || ""}"`,
          `"${Array.isArray(client.tags) ? client.tags.join("; ") : ""}"`,
          `"${client.createdAt.toISOString().split("T")[0]}"`,
        ].join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");

    // Create response with CSV content
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="clients-export-${
          new Date().toISOString().split("T")[0]
        }.csv"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Failed to export clients:", error);
    return NextResponse.json(
      { error: "Failed to export clients" },
      { status: 500 }
    );
  }
}
