"use client";

import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const WebsiteConstruction = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg shadow-lg border-0">
        <CardContent className="p-12 text-center">
          {/* Main Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center shadow-md">
              <Construction className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Under Construction
          </h1>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebsiteConstruction;
