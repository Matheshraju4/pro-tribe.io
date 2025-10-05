"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Package, Session } from "@/prisma/generated/prisma";

import { Save, X, Package as PackageIcon, CheckCircle } from "lucide-react";
import Loader, { ButtonLoader } from "@/components/modules/general/loader";
import {
  createPackageFormSchema,
  CreatePackageInput,
} from "@/lib/schemas/package";
import axios from "axios";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PackageFormProps {
  initialData?: Partial<Package>;

  mode?: "create" | "edit";
}

const PackageForm = ({
  initialData,

  mode = "create",
}: PackageFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionData, setSessionData] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string[]>([]);

  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  // Initialize form with proper default values
  const form = useForm<CreatePackageInput>({
    resolver: zodResolver(createPackageFormSchema),
    defaultValues: {
      packageName: initialData?.packageName || "",
      packageDescription: initialData?.packageDescription || "",
      packagePrice: initialData?.packagePrice || "",
      packageDiscount: initialData?.packageDiscount || "",
      validDays: initialData?.validDays || "",
      acceptedPaymentMethod: (initialData as any)?.acceptedPaymentMethod || [
        "Both",
      ],
    },
  });

  // Fetch session data
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoadingSessions(true);
        const response = await axios.get("/api/auth/trainer/session");
        console.log("SessionData", response.data);

        if (response.data.success) {
          setSessionData(response.data.sessions);
        } else {
          console.error("Failed to fetch sessions:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching session data:", error);
        // Don't block form loading if sessions fail
      } finally {
        setIsLoadingSessions(false);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (data: CreatePackageInput) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting data:", { ...data, selectedSession }); // Add this log

      const response = await axios.post("/api/auth/trainer/packages/create", {
        ...data,
        selectedSession,
      });

      if (response.data.success) {
        // Change this condition
        toast.success("Package created successfully!");
        router.push("/trainer/packages");
      } else {
        throw new Error(response.data.message || "Failed to create package");
      }
    } catch (error) {
      console.error("Error creating package:", error);
      toast.error("Failed to create package. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/trainer/packages");
  };

  const handleSelectedSession = useCallback(
    (session: Session) => {
      const { id, sessionPrice } = session;
      const isSelected = selectedSession.includes(id);

      // Calculate new package price
      const currentPrice = Number(form.getValues("packagePrice")) || 0;
      const sessionPriceNum = Number(sessionPrice) || 0;

      // Calculate new price
      const newPrice = isSelected
        ? currentPrice - sessionPriceNum // Remove session price
        : currentPrice + sessionPriceNum; // Add session price

      // Update form price first
      form.setValue("packagePrice", newPrice.toFixed(2));

      // Then update selection state
      setSelectedSession((prev) =>
        isSelected
          ? prev.filter((selectedId) => selectedId !== id)
          : [...prev, id]
      );
    },
    [selectedSession, form]
  );

  // Separate function for clearing sessions
  const handleClearSessions = useCallback(() => {
    form.setValue("packagePrice", "0.00");
    setSelectedSession([]);
  }, [form]);

  const packageDiscount = useWatch({
    control: form.control,
    name: "packageDiscount",
  });

  useEffect(() => {
    if (packageDiscount) {
      const packagePrice = Number(form.getValues("packagePrice")) || 0;
      const discount = Number(packageDiscount) || 0;
      const discountedPrice = packagePrice - (packagePrice * discount) / 100;
      form.setValue("packagePrice", discountedPrice.toFixed(2));
    }
  }, [packageDiscount]);

  return (
    <>
      {isLoadingSessions ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader size="md" text={"Preparing form..."} />
        </div>
      ) : (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <PackageIcon className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-2xl font-bold">
                {mode === "create" ? "Create New Package" : "Edit Package"}
              </CardTitle>
            </div>
            <p className="text-gray-600">
              {mode === "create"
                ? "Fill in the details to create a new package"
                : "Update the package information"}
            </p>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
              >
                {/* Package Name */}
                <FormField
                  control={form.control}
                  name="packageName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Premium Fitness Package"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Package Description */}
                <FormField
                  control={form.control}
                  name="packageDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what's included in this package..."
                          className="min-h-[100px]"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Sessions Selection */}
                {sessionData.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-gray-900">
                      Select Sessions for Package
                    </Label>
                    <p className="text-sm text-gray-500">
                      Choose the sessions that will be included in this package
                    </p>

                    <div className="max-h-[300px] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                      {sessionData.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id={session.id}
                              checked={selectedSession.includes(session.id)}
                              onCheckedChange={() =>
                                handleSelectedSession(session)
                              }
                              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex flex-col">
                              <label
                                htmlFor={session.id}
                                className="text-sm font-medium text-gray-900 cursor-pointer"
                              >
                                {session.sessionName}
                              </label>
                              <span className="text-xs text-gray-500">
                                {session.sessionType} •{" "}
                                {session.sessionDuration}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-semibold text-gray-900">
                                ${session.sessionPrice}
                              </span>
                              {session.sessionFrequency && (
                                <span className="text-xs text-gray-500">
                                  {session.sessionFrequency}
                                </span>
                              )}
                            </div>
                            <div
                              className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                session.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              )}
                            >
                              {session.isActive ? "Active" : "Inactive"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Selected Sessions Summary */}
                    {selectedSession.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-blue-600" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-blue-900">
                                {selectedSession.length} session
                                {selectedSession.length > 1 ? "s" : ""} selected
                              </span>
                              <span className="text-xs text-blue-700">
                                Total Price: ${form.getValues("packagePrice")}
                              </span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClearSessions}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Clear All
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* Price and Discount Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Package Price */}
                  <FormField
                    control={form.control}
                    name="packagePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Package Price ($) *</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="99.99"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Package Discount */}
                  <FormField
                    control={form.control}
                    name="packageDiscount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="0"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Validity Days */}
                <FormField
                  control={form.control}
                  name="validDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Validity Period (Days) *</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="30"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="acceptedPaymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accepted Payment Methods *</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          {[
                            { value: "Cash" as const, label: "Cash" },
                            { value: "Stripe" as const, label: "Stripe" },
                            {
                              value: "Both" as const,
                              label: "Both Cash & Stripe",
                            },
                          ].map((method) => (
                            <div
                              key={method.value}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`payment-${method.value}`}
                                checked={
                                  field.value?.includes(method.value) || false
                                }
                                onCheckedChange={(checked) => {
                                  const currentValue = field.value || [];
                                  if (checked) {
                                    // Add the payment method if it's not already included
                                    if (!currentValue.includes(method.value)) {
                                      field.onChange([
                                        ...currentValue,
                                        method.value,
                                      ]);
                                    }
                                  } else {
                                    // Remove the payment method
                                    field.onChange(
                                      currentValue.filter(
                                        (item) => item !== method.value
                                      )
                                    );
                                  }
                                }}
                              />
                              <Label
                                htmlFor={`payment-${method.value}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {method.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <ButtonLoader text="Saving..." />
                      </span>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {mode === "create"
                          ? "Create Package"
                          : "Update Package"}
                      </>
                    )}
                  </Button>

                  {handleCancel && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default PackageForm;
