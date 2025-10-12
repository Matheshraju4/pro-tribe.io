"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, CreditCard, Eye, Plus, ArrowLeft } from "lucide-react";
import { MembershipForm } from "@/components/modules/pages/trainer/memberships/membership-form";

type ViewType = null | "membership-form";

export default function PackagesMembershipsPage() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ViewType>(null);

  const handleView = (type: "package") => {
    if (type === "package") {
      router.push("/trainer/packages");
    }
  };

  const handleCreate = (type: "package") => {
    if (type === "package") {
      router.push("/trainer/packages/create");
    }
  };

  const handleMembershipCreate = () => {
    setCurrentView("membership-form");
  };

  const handleBack = () => {
    setCurrentView(null);
  };

  const handleSuccess = () => {
    setCurrentView(null);
  };

  // Show membership form view
  if (currentView === "membership-form") {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header with Back Button */}
          <div className="mb-6 flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Membership</h1>
              <p className="text-gray-600 text-sm">Create a new recurring membership plan</p>
            </div>
          </div>

          {/* Membership Form */}
          <MembershipForm onSuccess={handleSuccess} onCancel={handleBack} />
        </div>
      </div>
    );
  }

  // Show selection cards view
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Packages & Memberships</h1>
          <p className="text-gray-600">Manage your packages and membership offerings</p>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Package Card */}
          <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <CardHeader className="relative">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Packages</CardTitle>
              <CardDescription className="text-base mt-2">
                Create and manage training packages for your clients
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                  Bundle multiple sessions together
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                  Set package pricing and discounts
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                  Define validity periods
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
                  Track package usage and history
                </li>
              </ul>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={() => handleView("package")}
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
                <Button
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={() => handleCreate("package")}
                >
                  <Plus className="h-4 w-4" />
                  Create
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Membership Card */}
          <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            <CardHeader className="relative">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
                <CreditCard className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="text-xl">Memberships</CardTitle>
              <CardDescription className="text-base mt-2">
                Create recurring membership plans for your clients
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
                  Monthly or yearly subscriptions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
                  Recurring billing management
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
                  Member benefits and perks
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-600 rounded-full" />
                  Automatic renewals
                </li>
              </ul>
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={handleMembershipCreate}
                >
                  <Plus className="h-4 w-4" />
                  Create
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
