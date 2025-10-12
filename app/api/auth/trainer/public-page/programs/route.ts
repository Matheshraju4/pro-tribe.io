import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/authtoken";

// GET - Fetch packages and memberships for public page
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch packages
    const packages = await prisma.package.findMany({
      where: {
        trainerId: session.data.userId,
      },
      include: {
        sessionPackageConnection: {
          include: {
            session: {
              select: {
                id: true,
                sessionName: true,
                sessionDuration: true,
                sessionType: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch memberships
    const memberships = await prisma.membership.findMany({
      where: {
        trainerId: session.data.userId,
        visibility: "Public", // Only show public memberships
      },
      include: {
        membershipSessionConnection: {
          include: {
            session: {
              select: {
                id: true,
                sessionName: true,
                sessionDuration: true,
                sessionType: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform packages data
    const transformedPackages = packages.map((pkg) => ({
      id: pkg.id,
      name: pkg.packageName,
      description: pkg.packageDescription,
      price: pkg.packagePrice,
      discount: pkg.packageDiscount,
      validDays: pkg.validDays,
      sessions: pkg.sessionPackageConnection.map((conn) => ({
        id: conn.session.id,
        name: conn.session.sessionName,
        duration: conn.session.sessionDuration,
        type: conn.session.sessionType,
      })),
      type: "package",
    }));

    // Transform memberships data
    const transformedMemberships = memberships.map((membership) => ({
      id: membership.id,
      name: membership.membershipName,
      description: membership.membershipDescription,
      billingPeriod: membership.billingPeriod,
      weeklyPrice: membership.weeklyPrice,
      monthlyPrice: membership.monthlyPrice,
      yearlyPrice: membership.yearlyPrice,
      autoRenewal: membership.autoRenewal,
      sessions: membership.membershipSessionConnection.map((conn) => ({
        id: conn.session.id,
        name: conn.session.sessionName,
        duration: conn.session.sessionDuration,
        type: conn.session.sessionType,
      })),
      type: "membership",
    }));

    return NextResponse.json({
      packages: transformedPackages,
      memberships: transformedMemberships,
      totalPrograms: transformedPackages.length + transformedMemberships.length,
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 }
    );
  }
}
