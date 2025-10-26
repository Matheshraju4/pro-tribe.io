"use client";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Building2, Mail, Phone, Globe, MapPin, Image, Package, Users, Clock, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

function calculateCompletionPercentage(formData: any) {
  const requiredFields = [
    "BusinessName",
    "uniqueUrl",
    "BusinessDescription",
    "BusinessEmail",
    "BusinessPhone",
    "BusinessAddress",
    "BusinessCity",
    "BusinessLogo",
    "BusinessBanner",
    "BannerHeading",
    "BannerSubHeading",
    "YearsOfExperience",
    "HappyClients",
  ];

  const completedFields = requiredFields.filter(
    (field) => formData[field] && formData[field].toString().trim() !== ""
  );

  return Math.round((completedFields.length / requiredFields.length) * 100);
}

export default function Preview({
  control,
  operation,
  urlVisible,
}: {
  control: any;
  operation: "preview" | "create";
  urlVisible: boolean;
}) {
  // Move useWatch outside useEffect
  const watchedFormData = operation === "create" ? useWatch({ control }) : null;
  const [formData, setFormData] = useState(control);
  const [programs, setPrograms] = useState<any>(null);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const router = useRouter()

  useEffect(() => {
    if (operation === "preview") {
      setFormData(control);
    } else {
      setFormData(watchedFormData);
    }
  }, [control, operation, watchedFormData]);

  // Fetch programs data
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoadingPrograms(true);
        const response = await fetch("/api/auth/trainer/public-page/programs");
        if (response.ok) {
          const data = await response.json();
          setPrograms(data);
        }
      } catch (error) {
        console.error("Error fetching programs:", error);
      } finally {
        setLoadingPrograms(false);
      }
    };

    fetchPrograms();
  }, []);

  // If no data is available yet, show loading or empty state
  if (!formData) {
    return (
      <Card className="w-full sticky top-4 overflow-hidden h-fit bg-white shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-gray-500">
            Loading preview...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "w-full sticky top-4 overflow-hidden h-fit bg-white shadow-md",
        operation === "preview" ? "w-full" : "lg:w-[450px] xl:w-[500px]"
      )}
    >
      {/* Update the header styling */}
      {urlVisible && (
        <div className="w-full h-10 bg-gray-100 flex items-center px-4 gap-2 border-b">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="text-sm text-gray-600 flex items-center gap-2 px-4 py-1 bg-white rounded-md border">
              <Globe className="w-4 h-4" />
              {formData.uniqueUrl
                ? `protribe.com/${formData.uniqueUrl}`
                : `${formData.CustomWebsiteUrl}`}
            </div>
          </div>
        </div>
      )}

      <CardContent className="p-0">
        {/* Update banner section height */}
        <div className="relative w-full h-48 xl:h-56 bg-gradient-to-r from-gray-900 to-gray-700">
          {formData.BusinessBanner ? (
            <img
              src={formData.BusinessBanner}
              alt="Business Banner"
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white">
              <Image className="w-6 h-6 sm:w-8 sm:h-8 mb-2" />
              <span className="text-xs sm:text-sm">Gym Banner Image</span>
            </div>
          )}

          {/* Overlay Text */}
          <div className="absolute inset-0 flex items-center justify-center text-white px-4">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
                {formData.BannerHeading}
              </h2>
              <p className="text-xs sm:text-sm opacity-90">
                {formData.BannerSubHeading}
              </p>
            </div>
          </div>

          {/* Logo and Business Name Card */}
          <div className="absolute -bottom-16 left-2 right-2 sm:left-4 sm:right-4 bg-white rounded-lg shadow-md p-3 sm:p-4">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border">
                {formData.BusinessLogo ? (
                  <img
                    src={formData.BusinessLogo}
                    alt="Business Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="space-y-0.5 sm:space-y-1 pt-1 sm:pt-2">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 line-clamp-2">
                  {formData.BusinessName || "Your Gym Name"}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  {formData.BusinessShortDescription}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Update main content padding */}
        <div className="mt-20 px-6 py-4">
          {/* Update navigation menu */}
          <div className="flex gap-6 py-4 border-b text-sm">
            <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors">
              About
            </button>
            <button className="text-gray-600 hover:text-gray-800 transition-colors">
              Programs
            </button>
            <button className="text-gray-600 hover:text-gray-800 transition-colors">
              Contact
            </button>
          </div>

          {/* Update stats grid */}
          <div className="grid grid-cols-3 gap-4 py-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="text-2xl font-bold text-blue-600">
                {formData.YearsOfExperience}+
              </div>
              <div className="text-sm text-gray-600">Years Experience</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-blue-600">
                {formData.HappyClients}+
              </div>
              <div className="text-[10px] sm:text-xs text-gray-600">
                Happy Clients
              </div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-blue-600">
                {formData.Programs}+
              </div>
              <div className="text-[10px] sm:text-xs text-gray-600">
                Programs
              </div>
            </div>
          </div>

          {/* Update content sections */}
          <div className="space-y-8">
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-900">
                About Our Gym
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {formData.BusinessDescription}
              </p>
            </div>

            {/* Programs section */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-900">
                Available Programs
              </h4>
              
              {loadingPrograms ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : programs && (programs.packages.length > 0 || programs.memberships.length > 0) ? (
                <div className="space-y-4">
                  {/* Packages */}
                  {programs.packages.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Packages ({programs.packages.length})
                      </h5>
                      <div className="grid grid-cols-1 gap-3">
                        {programs.packages.slice(0, 3).map((pkg: any) => (
                          <div key={pkg.id} className="bg-gray-50 p-3 rounded-lg border hover:bg-gray-100 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {pkg.name}
                                </div>
                                {pkg.description && (
                                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {pkg.description}
                                  </div>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  {pkg.price && (
                                    <div className="flex items-center gap-1 text-xs text-green-600">
                                      <DollarSign className="h-3 w-3" />
                                      {pkg.price}
                                    </div>
                                  )}
                                  {pkg.sessions.length > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <Users className="h-3 w-3" />
                                      {pkg.sessions.length} sessions
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                Package
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {programs.packages.length > 3 && (
                          <div className="text-xs text-gray-500 text-center py-2">
                            +{programs.packages.length - 3} more packages
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Memberships */}
                  {programs.memberships.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Memberships ({programs.memberships.length})
                      </h5>
                      <div className="grid grid-cols-1 gap-3">
                        {programs.memberships.slice(0, 2).map((membership: any) => (
                          <div key={membership.id} className="bg-blue-50 p-3 rounded-lg border hover:bg-blue-100 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {membership.name}
                                </div>
                                {membership.description && (
                                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {membership.description}
                                  </div>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  {membership.billingPeriod === "Monthly" && membership.monthlyPrice && (
                                    <div className="flex items-center gap-1 text-xs text-blue-600">
                                      <DollarSign className="h-3 w-3" />
                                      {membership.monthlyPrice}/month
                                    </div>
                                  )}
                                  {membership.billingPeriod === "Weekly" && membership.weeklyPrice && (
                                    <div className="flex items-center gap-1 text-xs text-blue-600">
                                      <DollarSign className="h-3 w-3" />
                                      {membership.weeklyPrice}/week
                                    </div>
                                  )}
                                  {membership.billingPeriod === "Yearly" && membership.yearlyPrice && (
                                    <div className="flex items-center gap-1 text-xs text-blue-600">
                                      <DollarSign className="h-3 w-3" />
                                      {membership.yearlyPrice}/year
                                    </div>
                                  )}
                                  {membership.sessions.length > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                      <Clock className="h-3 w-3" />
                                      {membership.sessions.length} sessions
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Badge variant="default" className="text-xs">
                                Membership
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {programs.memberships.length > 2 && (
                          <div className="text-xs text-gray-500 text-center py-2">
                            +{programs.memberships.length - 2} more memberships
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">
                    No programs available yet
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Create packages and memberships to display them here
                  </div>
                </div>
              )}
            </div>

            {/* Update contact section */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-900">
                Get in Touch
              </h4>
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                {formData.BusinessEmail && (
                  <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                    </div>
                    <div className="truncate">{formData.BusinessEmail}</div>
                  </div>
                )}
                {formData.BusinessPhone && (
                  <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                    </div>
                    {formData.BusinessPhone}
                  </div>
                )}
                {(formData.BusinessAddress || formData.BusinessCity) && (
                  <div className="flex items-start gap-2 text-gray-600 text-xs sm:text-sm">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                    </div>
                    <div className="pt-0.5">
                      {formData.BusinessAddress && (
                        <div>{formData.BusinessAddress}</div>
                      )}
                      {formData.BusinessCity && (
                        <div className="text-gray-500">
                          {formData.BusinessCity}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Update CTA section */}
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <h4 className="text-lg font-semibold text-blue-900 mb-2">
                Ready to Start Your Journey?
              </h4>
              <button onClick={() => router.push(`/signup?url=${encodeURIComponent(formData.uniqueUrl)}`)} className="bg-blue-600 text-white text-sm px-6 py-3 rounded-md w-full hover:bg-blue-700 transition-colors">
                Get Started
              </button>
            </div>
          </div>

          {/* Update completion status */}
          <div className="border-t py-6 mt-8">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[10px] sm:text-xs font-medium text-gray-600">
                Profile Completion
              </h4>
              <span className="text-[10px] sm:text-xs text-gray-500">
                {calculateCompletionPercentage(formData)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1 sm:h-1.5">
              <div
                className="bg-blue-600 h-1 sm:h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${calculateCompletionPercentage(formData)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
