"use client";
import { cn } from "@/lib/utils";
import { Building2, Mail, Phone, Globe, Package, Users, MessageCircle, Award, Star, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
  const watchedFormData = operation === "create" ? useWatch({ control }) : null;
  const [formData, setFormData] = useState(control);
  const [programs, setPrograms] = useState<any>(null);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const router = useRouter();

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

  if (!formData) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        Loading preview...
      </div>
    );
  }

  // Combine all services (packages and memberships) for display
  const allServices = [
    ...(programs?.packages?.map((p: any) => ({ ...p, type: "package" })) || []),
    ...(programs?.memberships?.map((m: any) => ({ ...m, type: "membership" })) || []),
  ];

  return (
    <div className={cn(
      "relative flex h-auto min-h-screen w-full flex-col bg-white overflow-x-hidden",
      operation === "preview" ? "w-full" : "lg:max-w-6xl"
    )}>
      {/* Browser bar if urlVisible */}
      {urlVisible && (
        <div className="w-full h-10 bg-gray-100 flex items-center px-2 sm:px-4 gap-2 border-b">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-2 px-2 sm:px-4 py-1 bg-white rounded-md border">
              <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
              {formData.uniqueUrl
                ? `protribe.com/${formData.uniqueUrl}`
                : formData.CustomWebsiteUrl || "protribe.com/your-url"}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-6 lg:p-10">
        <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10">
          {/* Hero Section - Trainer Profile */}
          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8 bg-gray-50 dark:bg-gray-800 p-6 sm:p-8 rounded-xl">
            <div className="relative">
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32 sm:min-h-40 sm:w-40 border-4 border-white shadow-lg"
                style={{
                  backgroundImage: formData.BusinessLogo
                    ? `url("${formData.BusinessLogo}")`
                    : 'none',
                  backgroundColor: formData.BusinessLogo ? 'transparent' : '#e5e7eb'
                }}
              >
                {!formData.BusinessLogo && (
                  <div className="flex items-center justify-center h-full">
                    <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col justify-center text-center md:text-left w-full md:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
                {formData.BusinessName || "Your Business Name"}
              </h1>
              <p className="text-base sm:text-lg text-gray-600 mt-1">
                {formData.BannerSubHeading || formData.BusinessShortDescription || "Certified Personal Trainer"}
              </p>
              <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-lg">
                {formData.BusinessDescription || formData.BannerHeading || "Helping you achieve your fitness goals, one workout at a time."}
              </p>
              <div className="flex justify-center md:justify-start gap-3 sm:gap-4 mt-4">
                {formData.BusinessEmail && (
                  <a href={`mailto:${formData.BusinessEmail}`} className="text-gray-600 hover:text-primary transition-colors">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                )}
                {formData.BusinessPhone && (
                  <a href={`tel:${formData.BusinessPhone}`} className="text-gray-600 hover:text-primary transition-colors">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                )}
                <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              </div>
              <Button
                className="mt-4 sm:mt-6 bg-primary hover:bg-blue-600 text-white h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-bold self-center md:self-start w-full sm:w-auto"
                onClick={() => router.push(`/signup?url=${encodeURIComponent(formData.uniqueUrl || "")}`)}
              >
                Book Now
              </Button>
            </div>
          </div>

          {/* Services Section */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight px-2 sm:px-4 pb-3 pt-3 sm:pt-5">Services</h2>
            {loadingPrograms ? (
              <div className="flex items-center justify-center py-12 sm:py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : allServices.length > 0 ? (
              <div className="flex gap-4 sm:gap-6 p-2 sm:p-4">
                {allServices.map((service: any) => (
                  <div
                    key={service.id}
                    className="flex flex-col items-stretch justify-start rounded-xl bg-gray-50 dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                  >
                    {/* Service Image */}
                    <div
                      className="w-full bg-center bg-no-repeat aspect-video bg-cover bg-gray-200"
                      style={{
                        backgroundImage: formData.BusinessBanner
                          ? `url("${formData.BusinessBanner}")`
                          : 'none'
                      }}
                    >
                      {!formData.BusinessBanner && (
                        <div className="flex items-center justify-center h-full">
                          <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-stretch justify-between grow p-4 sm:p-6">
                      <div>
                        <p className="text-lg sm:text-xl font-bold leading-tight tracking-tight">
                          {service.name}
                        </p>
                        <p className="text-sm sm:text-base text-gray-600 font-normal leading-normal mt-2 line-clamp-3">
                          {service.description || "Professional training service tailored to your needs."}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mt-4">
                        <p className="text-base sm:text-lg font-bold text-primary">
                          {service.type === "package" && service.price && `$${service.price}`}
                          {service.type === "membership" && (
                            <>
                              {service.monthlyPrice && `$${service.monthlyPrice}/month`}
                              {service.weeklyPrice && `$${service.weeklyPrice}/week`}
                              {service.yearlyPrice && `$${service.yearlyPrice}/year`}
                            </>
                          )}
                          {!service.price && !service.monthlyPrice && !service.weeklyPrice && !service.yearlyPrice && "Contact for pricing"}
                        </p>
                        <Button
                          size="sm"
                          className="h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-medium bg-primary hover:bg-blue-600 text-white w-full sm:w-auto"
                          onClick={() => router.push(`/signup?url=${encodeURIComponent(formData.uniqueUrl || "")}`)}
                        >
                          {service.type === "package" ? "Book Now" : "Learn More"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg text-center m-2 sm:m-4">
                <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <div className="text-sm text-gray-600">No programs available yet</div>
                <div className="text-xs text-gray-500 mt-1">Create packages or memberships to display them here</div>
              </div>
            )}
          </div>

          {/* Stats Section - Show all stats fields */}
          {(formData.YearsOfExperience || formData.HappyClients || allServices.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-4">
              {formData.YearsOfExperience && (
                <div className="text-center p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl sm:text-3xl font-bold text-primary">
                    {formData.YearsOfExperience}+
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Years Experience</div>
                </div>
              )}
              {formData.HappyClients && (
                <div className="text-center p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl sm:text-3xl font-bold text-primary">
                    {formData.HappyClients}+
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Happy Clients</div>
                </div>
              )}
              {allServices.length > 0 && (
                <div className="text-center p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-md">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl sm:text-3xl font-bold text-primary">
                    {allServices.length}+
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Available Programs</div>
                </div>
              )}
            </div>
          )}

          {/* Testimonials Section */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight px-2 sm:px-4 pb-3 pt-3 sm:pt-5">What My Clients Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 p-2 sm:p-4">
              {/* Placeholder testimonials */}
              <div className="flex flex-col items-center text-center p-6 sm:p-8 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-md">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-300 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
                </div>
                <blockquote className="mt-2 sm:mt-4 text-sm sm:text-base text-gray-600 italic">
                  "{formData.BusinessName || "This trainer"} is incredible! I've seen amazing results in just a few months. Highly recommended!"
                </blockquote>
                <p className="font-bold mt-3 sm:mt-4">Sarah L.</p>
                <a className="text-primary text-xs sm:text-sm mt-2 hover:underline cursor-pointer">Read More</a>
              </div>
              <div className="flex flex-col items-center text-center p-6 sm:p-8 rounded-xl bg-gray-50 dark:bg-gray-800 shadow-md">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-300 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
                </div>
                <blockquote className="mt-2 sm:mt-4 text-sm sm:text-base text-gray-600 italic">
                  "The training programs are so effective and motivating. I've never been more consistent with my workouts."
                </blockquote>
                <p className="font-bold mt-3 sm:mt-4">Mark C.</p>
                <a className="text-primary text-xs sm:text-sm mt-2 hover:underline cursor-pointer">Read More</a>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          {(formData.BusinessEmail || formData.BusinessPhone || formData.BusinessAddress || formData.BusinessCity) && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight mb-4 sm:mb-6">Get in Touch</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {formData.BusinessEmail && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <a href={`mailto:${formData.BusinessEmail}`} className="text-sm sm:text-base hover:text-primary transition-colors truncate">
                      {formData.BusinessEmail}
                    </a>
                  </div>
                )}
                {formData.BusinessPhone && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <a href={`tel:${formData.BusinessPhone}`} className="text-sm sm:text-base hover:text-primary transition-colors">
                      {formData.BusinessPhone}
                    </a>
                  </div>
                )}
                {(formData.BusinessAddress || formData.BusinessCity) && (
                  <div className="flex items-start gap-3 text-gray-600">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div className="text-sm sm:text-base">
                      {formData.BusinessAddress && <div>{formData.BusinessAddress}</div>}
                      {formData.BusinessCity && <div className="text-gray-500">{formData.BusinessCity}</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="bg-primary/5 p-6 sm:p-8 rounded-xl text-center">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Ready to Start Your Journey?
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Join our fitness community and achieve your goals today
            </p>
            <Button
              className="bg-primary hover:bg-blue-600 text-white text-sm sm:text-base px-6 sm:px-8 py-6 sm:py-8 h-auto rounded-lg w-full sm:w-auto"
              onClick={() => router.push(`/signup?url=${encodeURIComponent(formData.uniqueUrl || "")}`)}
            >
              Get Started Now
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8 sm:mt-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">
            <div>
              <h3 className="font-bold text-base sm:text-lg">{formData.BusinessName || "TrainerApp"}</h3>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">{formData.BusinessShortDescription || "Your journey to fitness starts here."}</p>
            </div>
            <div className="flex gap-3 sm:gap-4">
              {formData.BusinessEmail && (
                <a href={`mailto:${formData.BusinessEmail}`} className="text-gray-600 hover:text-primary transition-colors">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              )}
              {formData.BusinessPhone && (
                <a href={`tel:${formData.BusinessPhone}`} className="text-gray-600 hover:text-primary transition-colors">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              )}
              <a href="#" className="text-gray-600 hover:text-primary transition-colors">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-4 sm:mt-6 pt-4 sm:pt-6 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-2">
            <p className="text-gray-600 text-xs sm:text-sm">© 2024 {formData.BusinessName || "TrainerApp"}. All rights reserved.</p>
            <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm">
              <a className="text-gray-600 hover:text-primary transition-colors cursor-pointer">Privacy Policy</a>
              <a className="text-gray-600 hover:text-primary transition-colors cursor-pointer">Terms of Service</a>
            </div>
          </div>

          {/* Profile Completion (only in preview mode) */}
          {operation === "create" && (
            <div className="border-t border-gray-200 dark:border-gray-700 mt-4 sm:mt-6 pt-4 sm:pt-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs sm:text-sm font-medium text-gray-600">Profile Completion</h4>
                <span className="text-xs sm:text-sm text-gray-500">{calculateCompletionPercentage(formData)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${calculateCompletionPercentage(formData)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
