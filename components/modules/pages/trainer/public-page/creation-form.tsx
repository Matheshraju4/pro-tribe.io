"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";
import { createPublicPageFormSchema } from "@/lib/schemas/dashboard";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Image,
  Calendar,
  User,
  X,
} from "lucide-react";
import { useWatch } from "react-hook-form";
import Preview from "./preview-page";
import { useRouter } from "next/navigation";
import {
  UploadButton,
  UploadDropzone,
} from "@/components/modules/general/uploadthing";

type PublicPageFormValues = z.infer<typeof createPublicPageFormSchema>;

interface CreationFormProps {
  initialData?: PublicPageFormValues;
  mode?: "create" | "edit";
}

export default function CreationForm({
  initialData,
  mode = "create",
}: CreationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    initialData?.BusinessLogo || null
  );
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    initialData?.BusinessBanner || null
  );
  const router = useRouter();

  const form = useForm<PublicPageFormValues>({
    resolver: zodResolver(createPublicPageFormSchema),
    defaultValues: {
      BusinessName: initialData?.BusinessName || "",
      BusinessShortDescription: initialData?.BusinessShortDescription || "",
      BannerHeading: initialData?.BannerHeading || "",
      BannerSubHeading: initialData?.BannerSubHeading || "",
      YearsOfExperience: initialData?.YearsOfExperience || "",
      HappyClients: initialData?.HappyClients || "",
      Programs: initialData?.Programs || "",
      uniqueUrl: initialData?.uniqueUrl || "",
      BusinessDescription: initialData?.BusinessDescription || "",
      BusinessEmail: initialData?.BusinessEmail || "",
      BusinessPhone: initialData?.BusinessPhone || "",
      CustomWebsiteUrl: initialData?.CustomWebsiteUrl || "",
      BusinessAddress: initialData?.BusinessAddress || "",
      BusinessCity: initialData?.BusinessCity || "",
      BusinessLogo: initialData?.BusinessLogo || "",
      BusinessBanner: initialData?.BusinessBanner || "",
    },
  });

  async function onSubmit(data: PublicPageFormValues) {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/trainer/public-page", {
        method: mode === "create" ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create public page");
      }

      const result = await response.json();
      toast.success(
        mode === "create"
          ? "Public page created successfully!"
          : "Public page updated successfully!"
      );
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <Card className="flex-1 min-w-0">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold">
            {mode === "create"
              ? "Create Your Public Page"
              : "Edit Your Public Page"}
          </CardTitle>
          <CardDescription>
            {mode === "create"
              ? "Set up your professional online presence. This information will be visible to your potential clients."
              : "Update your public page information. Changes will be reflected immediately."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* 1. Basic Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="BusinessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                              className="pl-9"
                              placeholder="Enter your business name"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Your official business or brand name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="uniqueUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unique URL</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                              className="pl-9"
                              placeholder="your-business-name"
                              {...field}
                              onChange={(e) => {
                                const value = e.target.value
                                  .toLowerCase()
                                  .replace(/\s+/g, "-");
                                field.onChange(value);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          This will be your page's web address
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="BusinessShortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Brief tagline for your business"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A short tagline that appears under your business name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              {/* 2. Media Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Business Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="BusinessLogo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Logo</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <div className="relative">
                              {!(logoPreview && field.value) && (
                                <UploadDropzone
                                  endpoint="imageUploader"
                                  onClientUploadComplete={(res) => {
                                    field.onChange(res?.[0]?.ufsUrl);
                                    setLogoPreview(res?.[0]?.ufsUrl);
                                  }}
                                  onUploadError={(error: Error) => {
                                    console.log(error);
                                    toast.error("Error uploading logo");
                                  }}
                                />
                              )}
                            </div>
                            {logoPreview && (
                              <div className="relative">
                                <div className="w-24 h-24 rounded-lg overflow-hidden">
                                  <img
                                    src={logoPreview}
                                    alt="Logo preview"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                  onClick={() => {
                                    setLogoPreview(null);
                                    field.onChange("");
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Recommended size: 200x200px, PNG or JPG
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="BusinessBanner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Banner</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <div className="relative">
                              {!(bannerPreview && field.value) && (
                                <UploadDropzone
                                  endpoint="imageUploader"
                                  onClientUploadComplete={(res) => {
                                    field.onChange(res?.[0]?.ufsUrl);
                                    setBannerPreview(res?.[0]?.ufsUrl);
                                  }}
                                  onUploadError={(error: Error) => {
                                    console.log(error);
                                    toast.error("Error uploading banner");
                                  }}
                                />
                              )}
                            </div>
                            {bannerPreview && (
                              <div className="relative">
                                <div className="w-full h-32 rounded-lg overflow-hidden">
                                  <img
                                    src={bannerPreview}
                                    alt="Banner preview"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                  onClick={() => {
                                    setBannerPreview(null);
                                    field.onChange("");
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Recommended size: 1200x400px, PNG or JPG
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* 3. Banner Content Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Banner Content</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="BannerHeading"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banner Heading</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter banner heading"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The main title displayed on the banner
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="BannerSubHeading"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banner Sub-Heading</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter banner sub-heading"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A secondary title or tagline for the banner
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* 4. Business Details & Statistics */}
              <div className="space-y-6">
                {/* Business Description */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Business Details
                  </h3>
                  <FormField
                    control={form.control}
                    name="BusinessDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your business, services, and what makes you unique..."
                            className="min-h-[120px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Write a compelling description of your business
                          (recommended: 100-300 characters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Statistics Section */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium">Business Statistics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="YearsOfExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 5"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            How many years have you been in the industry?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="HappyClients"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Happy Clients</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 100"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            How many clients have you served?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="Programs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Programs Offered</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g., 50"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            How many programs do you offer?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* 5. Contact Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="BusinessEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                              className="pl-9"
                              type="email"
                              placeholder="business@example.com"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="BusinessPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Phone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                              className="pl-9"
                              type="tel"
                              placeholder="+1234567890"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="CustomWebsiteUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website URL (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                              className="pl-9"
                              type="url"
                              placeholder="https://your-website.com"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Your existing website if you have one
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="BusinessAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                            <Textarea
                              className="pl-9 min-h-[80px]"
                              placeholder="Enter your business address"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={isLoading}
                >
                  {isLoading
                    ? mode === "create"
                      ? "Creating..."
                      : "Updating..."
                    : mode === "create"
                    ? "Create Public Page"
                    : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="lg:w-[450px] xl:w-[500px]">
        <Preview control={form.control} operation="create" urlVisible={true} />
      </div>
    </div>
  );
}
