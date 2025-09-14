import Loader from "@/components/modules/general/loader";
import WebsiteConstruction from "@/components/modules/general/website-construction";
import PreviewPage from "@/components/modules/pages/trainer/public-page/preview-page";
import prisma from "@/lib/prisma";
import { Suspense } from "react";
import Image from "next/image";

// Also add dynamic metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicpage: string[] }>;
}) {
  const { publicpage } = await params;
  const slug = publicpage[0];

  const data = await prisma.publicPage.findUnique({
    where: { uniqueUrl: slug },
    select: {
      BusinessName: true,
      BusinessDescription: true,
      BusinessLogo: true,
    },
  });

  return {
    title: data?.BusinessName || "Public Page",
    description: data?.BusinessDescription,
    icon: data?.BusinessLogo,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ publicpage: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-3 min-h-screen flex items-center justify-center">
          <Loader />
        </div>
      }
    >
      <PublicPageContent params={params} />
    </Suspense>
  );
}

async function PublicPageContent({
  params,
}: {
  params: Promise<{ publicpage: string }>;
}) {
  const { publicpage } = await params;
  const data = await prisma.publicPage.findUnique({
    where: { uniqueUrl: publicpage[0].toString() },
    select: {
      BusinessName: true,
      BusinessLogo: true,
      BusinessBanner: true,
      BusinessShortDescription: true,
      BannerHeading: true,
      BannerSubHeading: true,
      YearsOfExperience: true,
      HappyClients: true,
      Programs: true,
      BusinessDescription: true,
      BusinessEmail: true,
      BusinessPhone: true,
      CustomWebsiteUrl: true,
      BusinessAddress: true,
      BusinessCity: true,
    },
  });

  if (!data) {
    return (
      <div className="max-w-6xl mx-auto px-3">
        <WebsiteConstruction />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3">
      <PreviewPage control={data} operation={"preview"} urlVisible={false} />
    </div>
  );
}
