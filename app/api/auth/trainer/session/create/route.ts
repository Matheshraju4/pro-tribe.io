import { verifyToken } from "@/lib/authtoken";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const {
    sessionName,
    sessionDescription,
    sessionDuration,
    sessionLocation,
    sessionType,
    sessionMaxCapacity,
    sessionFrequency,
    bufferTime,
    sessionPrice,
    sessionValidity,
    sessionDate,
    sessionStartDate,
    sessionEndDate,
    sessionDateAndTime,
  } = await req.json();

  const cookieStore = await cookies();

  console.log("cookie", cookieStore.get("proTribe-authToken")?.value);
  const trainerId = await verifyToken(
    cookieStore.get("proTribe-authToken")?.value!
  );
  console.log(trainerId);
  return NextResponse.json(
    { message: "Session created successfully" },
    { status: 200 }
  );
  //   const session = await prisma.session.create({
  //     data: {
  //       sessionName,
  //       sessionDescription,

  //       sessionPrice,
  //       trainerId: trainerId,

  //     },
  //   });
}
