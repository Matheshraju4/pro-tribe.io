import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET - Public endpoint to view a trainer's public page
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await context.params;

    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    // Find the public page by unique URL or custom website URL
    const publicPage = await prisma.publicPage.findFirst({
      where: {
        OR: [
          { uniqueUrl: username },
          { CustomWebsiteUrl: username },
        ],
      },
      include: {
        trainer: {
          select: {
            name: true,
            email: true,
            mobileNumber: true,
            age: true,
            gender: true,
          },
        },
      },
    });

    if (!publicPage) {
      return NextResponse.json(
        { error: "Public page not found" },
        { status: 404 }
      );
    }

    // Fetch packages for this trainer
    const packages = await prisma.package.findMany({
      where: {
        trainerId: publicPage.trainerId,
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

    // Fetch public memberships for this trainer
    const memberships = await prisma.membership.findMany({
      where: {
        trainerId: publicPage.trainerId,
        visibility: "Public",
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

    // Return public page data with programs
    return NextResponse.json({
      publicPage,
      programs: {
        packages: transformedPackages,
        memberships: transformedMemberships,
        totalPrograms: transformedPackages.length + transformedMemberships.length,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching public page:", error);
    return NextResponse.json(
      { error: "Failed to fetch public page" },
      { status: 500 }
    );
  }
}
