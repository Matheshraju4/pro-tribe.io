import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/authtoken";

// Sample client data
const sampleClients = [
  {
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1-555-0123",
    company: "TechCorp Inc.",
    address: "123 Main Street",
    city: "New York",
    postcode: "10001",
    country: "United States",
    tags: ["Fitness Enthusiast", "Beginner", "Weight Loss"]
  },
  {
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@email.com",
    phone: "+1-555-0124",
    company: "Design Studio",
    address: "456 Oak Avenue",
    city: "Los Angeles",
    postcode: "90210",
    country: "United States",
    tags: ["Athlete", "Strength Training", "Advanced"]
  },
  {
    firstName: "Emily",
    lastName: "Rodriguez",
    email: "emily.rodriguez@email.com",
    phone: "+1-555-0125",
    company: "Marketing Agency",
    address: "789 Pine Street",
    city: "Chicago",
    postcode: "60601",
    country: "United States",
    tags: ["Yoga", "Flexibility", "Stress Relief"]
  },
  {
    firstName: "David",
    lastName: "Thompson",
    email: "david.thompson@email.com",
    phone: "+1-555-0126",
    company: "Finance Corp",
    address: "321 Elm Drive",
    city: "Houston",
    postcode: "77001",
    country: "United States",
    tags: ["Cardio", "Weight Management", "Busy Professional"]
  },
  {
    firstName: "Lisa",
    lastName: "Anderson",
    email: "lisa.anderson@email.com",
    phone: "+1-555-0127",
    company: "Healthcare Solutions",
    address: "654 Maple Lane",
    city: "Phoenix",
    postcode: "85001",
    country: "United States",
    tags: ["Rehabilitation", "Post-Injury", "Physical Therapy"]
  }
];

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated trainer session
    const session = await getSession(request);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in first" },
        { status: 401 }
      );
    }

    const trainerId = session.data.userId;
    console.log("Creating sample clients for trainer:", trainerId);

    // Check if any of these clients already exist for this trainer
    const existingEmails = await prisma.client.findMany({
      where: {
        email: {
          in: sampleClients.map(client => client.email)
        },
        trainerId: trainerId
      },
      select: {
        email: true
      }
    });

    const existingEmailList = existingEmails.map(client => client.email);
    const newClients = sampleClients.filter(client => !existingEmailList.includes(client.email));

    if (newClients.length === 0) {
      return NextResponse.json(
        { 
          message: "All sample clients already exist for this trainer",
          created: 0,
          skipped: sampleClients.length
        },
        { status: 200 }
      );
    }

    // Create the new clients
    const createdClients = await prisma.client.createMany({
      data: newClients.map(client => ({
        ...client,
        trainerId: trainerId
      })),
      skipDuplicates: true
    });

    console.log(`Successfully created ${createdClients.count} sample clients`);

    return NextResponse.json(
      {
        message: "Sample clients created successfully",
        created: createdClients.count,
        skipped: existingEmailList.length,
        clients: newClients.map(client => ({
          name: `${client.firstName} ${client.lastName}`,
          email: client.email,
          tags: client.tags
        }))
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Failed to create sample clients:", error);
    
    // Handle specific database errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "One or more clients with these emails already exist" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create sample clients" },
      { status: 500 }
    );
  }
}

// // GET method to retrieve sample client data (for preview)
// export async function GET(request: NextRequest) {
//   try {
//     const session = await getSession(request);
    
//     if (!session) {
//       return NextResponse.json(
//         { error: "Unauthorized - Please log in first" },
//         { status: 401 }
//       );
//     }

//     return NextResponse.json(
//       {
//         message: "Sample clients data",
//         sampleClients: sampleClients.map(client => ({
//           name: `${client.firstName} ${client.lastName}`,
//           email: client.email,
//           phone: client.phone,
//           company: client.company,
//           location: `${client.city}, ${client.country}`,
//           tags: client.tags
//         })),
//         totalCount: sampleClients.length
//       },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error("Failed to retrieve sample clients:", error);
//     return NextResponse.json(
//       { error: "Failed to retrieve sample clients" },
//       { status: 500 }
//     );
//   }
// }