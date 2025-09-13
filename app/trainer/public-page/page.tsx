"use client";
import CreationForm from "@/components/modules/pages/trainer/public-page/creation-form";
import PreviewPage from "@/components/modules/pages/trainer/public-page/preview-page";
import { Button } from "@/components/ui/button";
import axios from "axios";

import { ArrowRight, Globe, PencilLine } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const PublicPage = () => {
  const [data, setData] = useState();
  const [mode, setMode] = useState<"edit" | "create" | null>(null);
  useEffect(() => {
    async function fetchData() {
      try {
        // Fix: Changed the API route path
        const response = await axios.get("/api/auth/trainer/public-page");
        setData(response?.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Something Went Wrong");
      }
    }
    fetchData();
  }, []);
  return (
    <div className="flex flex-col gap-4 max-w-7xl mx-auto px-3">
      {data && mode === null ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-end gap-4">
            <Button variant="destructive" onClick={() => setMode("edit")}>
              Edit Page <PencilLine className="ml-2 h-4 w-4" />
            </Button>
            <Button>
              Preview Page <Globe className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <PreviewPage control={data} operation={"preview"} urlVisible={true} />
        </div>
      ) : (
        <CreationForm mode={mode || "create"} initialData={data} />
      )}
    </div>
  );
};

export default PublicPage;
