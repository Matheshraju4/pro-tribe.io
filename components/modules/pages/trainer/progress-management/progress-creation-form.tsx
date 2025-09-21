"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  CheckSquare,
  Type,
  Star,
  Settings,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";

// Enhanced schema with better validation
const progressTrackerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(50, "Name must be less than 50 characters"),
    description: z
      .string()
      .max(200, "Description must be less than 200 characters")
      .optional(),
    type: z.enum(["numeric", "boolean", "rating"]),
    unit: z.string().optional(),
    minValue: z
      .number()
      .min(0, "Minimum value must be 0 or greater")
      .optional(),
    maxValue: z.number().min(1, "Maximum value must be at least 1").optional(),
    // Boolean specific
    trueLabel: z.string().optional(),
    falseLabel: z.string().optional(),
    // Rating specific
    ratingScale: z
      .number()
      .min(2, "Rating scale must be at least 2")
      .max(10, "Rating scale must be 10 or less")
      .optional(),
  })
  .refine(
    (data) => {
      // Numeric validation
      if (data.type === "numeric") {
        if (!data.minValue || !data.maxValue) {
          return false;
        }
        if (data.minValue >= data.maxValue) {
          return false;
        }
      }
      return true;
    },
    {
      message:
        "For numeric trackers, minimum value must be less than maximum value",
      path: ["minValue"],
    }
  );

type ProgressTrackerFormValues = z.infer<typeof progressTrackerSchema>;

const trackerTypes = [
  {
    value: "numeric",
    label: "Numeric Tracker",
    description: "Track numerical values with min/max range",
    icon: BarChart3,
    color: "bg-blue-500",
  },
  {
    value: "boolean",
    label: "Boolean Tracker",
    description: "Track yes/no or true/false values",
    icon: CheckSquare,
    color: "bg-green-500",
  },
  {
    value: "rating",
    label: "Rating Tracker",
    description: "Track ratings on a scale (1-10)",
    icon: Star,
    color: "bg-orange-500",
  },
];

export default function ProgressCreationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const router = useRouter();
  const form = useForm<ProgressTrackerFormValues>({
    resolver: zodResolver(progressTrackerSchema),
    defaultValues: {
      name: "",
      description: "",
      type: undefined,
      unit: "",
      minValue: 0,
      maxValue: 100,
      trueLabel: "Yes",
      falseLabel: "No",
      ratingScale: 5,
    },
  });

  const watchedType = form.watch("type");

  const onSubmit = async (data: ProgressTrackerFormValues) => {
    try {
      setIsLoading(true);
      console.log("Progress tracker data:", data);

      const response = await axios.post("/api/progress-trackers", data);

      if (response.status === 201) {
        toast.success("Progress tracker created successfully!");
        form.reset();
        setSelectedType("");
        router.push("/trainer/progress-management");
      } else {
        toast.error("Failed to create progress tracker. Please try again.");
      }
    } catch (error: any) {
      console.error("Failed to create progress tracker:", error);

      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to create progress tracker. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    form.setValue("type", value as any);

    // Reset type-specific fields when changing type
    if (value !== "numeric") {
      form.setValue("minValue", undefined);
      form.setValue("maxValue", undefined);
      form.setValue("unit", "");
    }
    if (value !== "boolean") {
      form.setValue("trueLabel", "Yes");
      form.setValue("falseLabel", "No");
    }
    if (value !== "rating") {
      form.setValue("ratingScale", 5);
    }
  };

  const selectedTrackerType = trackerTypes.find(
    (type) => type.value === watchedType
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Create Progress Tracker
        </h1>
        <p className="text-muted-foreground">
          Set up a custom progress tracker to monitor client achievements
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tracker Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Weight Loss, Mood Rating"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for your progress tracker
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide more details about this progress tracker..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Tracker Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Tracker Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Tracker Type *</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {trackerTypes.map((type) => {
                        const IconComponent = type.icon;
                        return (
                          <div
                            key={type.value}
                            className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
                              watchedType === type.value
                                ? "border-primary bg-primary/5"
                                : "border-muted hover:border-primary/50"
                            }`}
                            onClick={() => handleTypeChange(type.value)}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`p-2 rounded-lg ${type.color} text-white`}
                              >
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold">{type.label}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {type.description}
                                </p>
                              </div>
                              {watchedType === type.value && (
                                <Badge variant="default" className="ml-2">
                                  Selected
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Type-specific Configuration */}
          {watchedType && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Configuration
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure settings for your{" "}
                  {selectedTrackerType?.label.toLowerCase()}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {watchedType === "numeric" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="minValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Value *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="0"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="maxValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Maximum Value *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="100"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., kg, lbs, %"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Optional unit of measurement
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {watchedType === "boolean" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="trueLabel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>True Label</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Yes, Completed, Done"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Label for positive/true values
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="falseLabel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>False Label</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., No, Not Done, Pending"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Label for negative/false values
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {watchedType === "rating" && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="ratingScale"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rating Scale</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value?.toString()}
                              onValueChange={(value) =>
                                field.onChange(Number(value))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select rating scale" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="2">1-2 (Binary)</SelectItem>
                                <SelectItem value="3">
                                  1-3 (Low/Medium/High)
                                </SelectItem>
                                <SelectItem value="4">
                                  1-4 (Quarter Scale)
                                </SelectItem>
                                <SelectItem value="5">
                                  1-5 (Standard)
                                </SelectItem>
                                <SelectItem value="6">
                                  1-6 (Extended)
                                </SelectItem>
                                <SelectItem value="7">
                                  1-7 (Detailed)
                                </SelectItem>
                                <SelectItem value="8">
                                  1-8 (Comprehensive)
                                </SelectItem>
                                <SelectItem value="9">
                                  1-9 (Very Detailed)
                                </SelectItem>
                                <SelectItem value="10">
                                  1-10 (Full Scale)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormDescription>
                            Choose the rating scale for this tracker
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Preview */}
          {watchedType && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <p className="text-sm text-muted-foreground">
                  This is how your progress tracker will appear
                </p>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      {form.watch("name") || "Tracker Name"}
                    </h3>
                    <Badge variant="secondary">
                      {selectedTrackerType?.label}
                    </Badge>
                  </div>
                  {form.watch("description") && (
                    <p className="text-sm text-muted-foreground">
                      {form.watch("description")}
                    </p>
                  )}
                  <div className="text-sm">
                    {watchedType === "numeric" && (
                      <p>
                        Range: {form.watch("minValue") || 0} -{" "}
                        {form.watch("maxValue") || 100}
                        {form.watch("unit") && ` ${form.watch("unit")}`}
                      </p>
                    )}
                    {watchedType === "boolean" && (
                      <p>
                        Options: {form.watch("falseLabel") || "No"} /{" "}
                        {form.watch("trueLabel") || "Yes"}
                      </p>
                    )}
                    {watchedType === "rating" && (
                      <p>Scale: 1 - {form.watch("ratingScale") || 5}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Progress Tracker"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
