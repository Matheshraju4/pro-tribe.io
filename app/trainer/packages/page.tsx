import Loader from "@/components/modules/general/loader";
import PackageDashboard from "@/components/modules/pages/trainer/packages/package-dashboard";
import prisma from "@/lib/prisma";
import { Suspense } from "react";

const PackagesPage = async () => {
  const packages = await prisma.package.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <Suspense
      fallback={
        <div>
          <Loader className="min-h-screen" />
        </div>
      }
    >
      <PackageDashboard packages={packages} />
    </Suspense>
  );
};

export default PackagesPage;
