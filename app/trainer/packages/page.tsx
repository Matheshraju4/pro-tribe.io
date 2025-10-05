"use client";

import Loader, { NormalLoader } from "@/components/modules/general/loader";
import PackageDashboard from "@/components/modules/pages/trainer/packages/package-dashboard";
import { Package } from "@/prisma/generated/prisma";
import axios from "axios";

import { Suspense, useEffect, useState } from "react";

const PackagesPage = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    async function fetchPackages() {
      setIsLoading(true);
      const response = await axios.get("/api/auth/trainer/packages");
      console.log("Response", response.data);
      setPackages(response.data.packages);
      setIsLoading(false);
    }
    fetchPackages();
  }, []);

  return (
    <>
      {isLoading ? <NormalLoader /> : <PackageDashboard packages={packages} />}
    </>
  );
};

export default PackagesPage;
