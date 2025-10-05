"use client";

//TODO: Conditionally render Select time based on Selected Dates
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState, useCallback, useMemo } from "react";
import TimeSelectCard from "@/components/modules/general/time-select-card";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createSessionFormSchema } from "@/lib/schemas/dashboard";
import { Tag } from "@/prisma/generated/prisma";
import { Plus, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type CreateSessionForm = z.infer<typeof createSessionFormSchema>;

export default function CreateSessionPage() {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [sessionTags, setSessionTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const form = useForm<CreateSessionForm>({
    resolver: zodResolver(createSessionFormSchema),
    mode: "onBlur", // Only validate on blur, not on every keystroke
    defaultValues: {
      sessionName: "",
      sessionDescription: "",
      sessionDuration: "",
      sessionLocation: "",
      sessionType: "OneToOne",
      sessionMaxCapacity: 1,
      sessionFrequency: "OneTime",
      bufferTime: "",
      sessionPrice: "",
      sessionValidity: new Date(),
      sessionDate: new Date(),
      sessionStartDate: new Date(),
      sessionEndDate: new Date(),
      sessionTags: [],
      sessionDateAndTime: [
        {
          selectedDay: "Monday",
          startTime: "",
          endTime: "",
        },
      ],
    },
  });
console.log("session Tags", sessionTags);

  // Use watch only for specific fields that need to trigger conditional rendering
  const sessionType = form.watch("sessionType");
  const sessionFrequency = form.watch("sessionFrequency");

  const onSubmit = useCallback(
    async (data: CreateSessionForm) => {
      setIsLoading(true);
    
      if (createSessionFormSchema.safeParse(data).success) {
        console.log("session Tags from Form", sessionTags);
        data.sessionTags = sessionTags;
        console.log("Actual Data",data)
        try {
          const response = await axios.post(
            "/api/auth/trainer/session/create",
            data
          );

          if (response.status === 200) {
            toast.success("Session created successfully");
            router.push("/trainer/sessions");
          } else {
            toast.error("Failed to create session");
          }
        } catch (error) {
          toast.error("Failed to create session");
          console.error("Error creating session:", error);
        }
      } else {
        console.log(
          "Validation failed:",
          createSessionFormSchema.safeParse(data).error
        );
      }
      setIsLoading(false);
    },
    [router]
  );

  // Memoize the date input helper to prevent recreation on every render
  const toDateInput = useCallback((d?: Date | null) => {
    if (!d) return "";

    // Check if it's a valid date
    if (d instanceof Date && !isNaN(d.getTime())) {
      try {
        return d.toISOString().slice(0, 10);
      } catch {
        return "";
      }
    }

    return "";
  }, []);

  // Memoize time options to prevent recreation on every render
  const timeOptions = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => {
        const hours = String(i).padStart(2, "0");
        return `${hours}:00`;
      }),
    []
  );

  // Memoize days sorting function
  const sortDaysInOrder = useCallback((days: string[]) => {
    const dayOrder = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
  }, []);

  // Memoize days of week array
  const daysOfWeek = useMemo(
    () => [
      { label: "Sunday", value: "Sunday" },
      { label: "Monday", value: "Monday" },
      { label: "Tuesday", value: "Tuesday" },
      { label: "Wednesday", value: "Wednesday" },
      { label: "Thursday", value: "Thursday" },
      { label: "Friday", value: "Friday" },
      { label: "Saturday", value: "Saturday" },
    ],
    []
  );

  // Optimize selected days update with useCallback
  const handleDayToggle = useCallback((dayValue: string, checked: boolean) => {
    setSelectedDays((prev) =>
      checked ? [...prev, dayValue] : prev.filter((d) => d !== dayValue)
    );
  }, []);

  // Only run effect when sessionFrequency changes
  useEffect(() => {
    if (sessionFrequency === "OneTime") {
      form.setValue("sessionDate", new Date());
    } else if (sessionFrequency === "Recurring") {
      const currentStartDate = form.getValues("sessionStartDate");
      const currentEndDate = form.getValues("sessionEndDate");

      if (!currentStartDate) {
        form.setValue("sessionStartDate", new Date());
      }
      if (!currentEndDate) {
        form.setValue("sessionEndDate", new Date());
      }
    }
  }, [sessionFrequency, form]);

  // Memoize the time slot change handlers
  const handleTimeChange = useCallback(
    (index: number, field: "startTime" | "endTime", time: string) => {
      form.setValue(`sessionDateAndTime.${index}.${field}`, time);
      // Trigger form re-render by touching the field
      form.trigger(`sessionDateAndTime.${index}.${field}`);
    },
    [form]
  );

  type WeekDay =
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";

  // Add this effect to sync selectedDays with form state
  useEffect(() => {
    if (selectedDays.length > 0) {
      const currentSessionDateAndTime =
        form.getValues("sessionDateAndTime") || [];
      const updatedSessionDateAndTime = selectedDays.map((day, index) => {
        const existingData = currentSessionDateAndTime[index] || {
          selectedDay: day as WeekDay,
          startTime: "",
          endTime: "",
        };
        return {
          ...existingData,
          selectedDay: day as WeekDay,
        };
      });

      form.setValue("sessionDateAndTime", updatedSessionDateAndTime);
    }
  }, [selectedDays, form]);

  function addTag(e: any) {
    e.preventDefault();

    if (newTag.trim() && !sessionTags.includes(newTag.trim())) {
      const updatedTags = [...sessionTags, newTag.trim()];
      setSessionTags(updatedTags);

      setNewTag("");
    }
  }

  function removeTag(tagToRemove: string) {
    const updatedTags = sessionTags.filter((tag) => tag !== tagToRemove);
    setSessionTags(updatedTags);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-3 sm:p-6">
      <Card className="w-full max-w-5xl">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
          <div className="flex flex-col gap-2">
            <CardTitle className="text-xl sm:text-2xl">
              Create a new session
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Provide the details below to create a session
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 sm:space-y-6 flex flex-col gap-4 sm:gap-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <FormField
                  control={form.control}
                  name="sessionName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Morning HIIT" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sessionLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Studio A or Zoom link"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="sessionDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the session, goals, and any requirements..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <FormField
                  control={form.control}
                  name="sessionDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 60 mins" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bufferTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Buffer Time</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 10 mins" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="sessionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Session Type</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                          >
                            <div className="flex items-center space-x-2 rounded-md border p-3">
                              <RadioGroupItem id="type-1to1" value="OneToOne" />
                              <label
                                htmlFor="type-1to1"
                                className="text-sm font-medium"
                              >
                                One-to-One
                              </label>
                            </div>
                            <div className="flex items-center space-x-2 rounded-md border p-3">
                              <RadioGroupItem id="type-group" value="Group" />
                              <label
                                htmlFor="type-group"
                                className="text-sm font-medium"
                              >
                                Group
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {sessionType === "Group" && (
                    <FormField
                      control={form.control}
                      name="sessionMaxCapacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Capacity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              step="1"
                              value={
                                Number.isNaN(field.value as number)
                                  ? ""
                                  : field.value
                              }
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? NaN
                                    : Number(e.target.value)
                                )
                              }
                              placeholder="e.g. 20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
                <div className="flex flex-col gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="sessionFrequency"
                    render={({ field }) => (
                      <FormItem className="w-full sm:max-w-md">
                        <FormLabel>Frequency</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                          >
                            <div className="flex items-center space-x-2 rounded-md border p-3">
                              <RadioGroupItem
                                id="freq-onetime"
                                value="OneTime"
                              />
                              <label
                                htmlFor="freq-onetime"
                                className="text-sm font-medium"
                              >
                                One-time
                              </label>
                            </div>
                            <div className="flex items-center space-x-2 rounded-md border p-3">
                              <RadioGroupItem
                                id="freq-recurring"
                                value="Recurring"
                              />
                              <label
                                htmlFor="freq-recurring"
                                className="text-sm font-medium"
                              >
                                Recurring
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {sessionFrequency === "Recurring" ? (
                    <div className="space-y-4 sm:space-y-6">
                      {/* Date Range Section */}
                      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                          Session Date Range
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                          <FormField
                            control={form.control}
                            name="sessionStartDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  Start Date
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    value={toDateInput(field.value as Date)}
                                    onChange={(e) =>
                                      field.onChange(new Date(e.target.value))
                                    }
                                    className="h-11 border-gray-300 focus:border-primary focus:ring-primary"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="sessionEndDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">
                                  End Date
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    value={toDateInput(field.value as Date)}
                                    onChange={(e) =>
                                      field.onChange(new Date(e.target.value))
                                    }
                                    className="h-11 border-gray-300 focus:border-primary focus:ring-primary"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Days Selection Section */}
                      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                          Select Days of the Week
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                          {daysOfWeek.map((day) => (
                            <div
                              key={day.value}
                              className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg border-2 transition-all duration-200 hover:border-primary/50"
                            >
                              <Checkbox
                                id={day.value}
                                checked={selectedDays.includes(day.value)}
                                onCheckedChange={(checked) =>
                                  handleDayToggle(day.value, checked as boolean)
                                }
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <label
                                htmlFor={day.value}
                                className="text-xs sm:text-sm font-medium text-gray-700 cursor-pointer select-none"
                              >
                                {day.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Time Slots Section */}
                      {selectedDays.length > 0 && (
                        <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                              Set Time Slots
                            </h3>
                            <span className="text-sm text-gray-500">
                              {selectedDays.length} day
                              {selectedDays.length !== 1 ? "s" : ""} selected
                            </span>
                          </div>

                          <div className="space-y-3">
                            {sortDaysInOrder([...selectedDays]).map(
                              (day, index) => (
                                <TimeSelectCard
                                  key={day}
                                  day={day}
                                  startTime={
                                    form.watch(
                                      `sessionDateAndTime.${index}.startTime`
                                    ) || ""
                                  }
                                  endTime={
                                    form.watch(
                                      `sessionDateAndTime.${index}.endTime`
                                    ) || ""
                                  }
                                  onStartTimeChange={(time) =>
                                    handleTimeChange(index, "startTime", time)
                                  }
                                  onEndTimeChange={(time) =>
                                    handleTimeChange(index, "endTime", time)
                                  }
                                />
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* No Days Selected Message */}
                      {selectedDays.length === 0 && (
                        <div className="text-center py-6 sm:py-8 text-gray-500">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg
                              className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <p className="text-sm">
                            Select days above to configure time slots
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <FormField
                        control={form.control}
                        name="sessionDate"
                        render={({ field }) => (
                          <FormItem className="w-full sm:max-w-xs">
                            <FormLabel>Session Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                value={toDateInput(field.value as Date)}
                                onChange={(e) =>
                                  field.onChange(new Date(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sessionDateAndTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Time</FormLabel>
                            <FormControl>
                              <div className="">
                                {field.value?.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
                                  >
                                    <FormField
                                      control={form.control}
                                      name={`sessionDateAndTime.${index}.startTime`}
                                      render={({ field: startField }) => (
                                        <FormItem className="flex-1">
                                          <FormControl>
                                            <Select
                                              value={startField.value}
                                              onValueChange={
                                                startField.onChange
                                              }
                                            >
                                              <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select start time" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {timeOptions.map((time) => (
                                                  <SelectItem
                                                    key={time}
                                                    value={time}
                                                  >
                                                    {time}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />

                                    <FormField
                                      control={form.control}
                                      name={`sessionDateAndTime.${index}.endTime`}
                                      render={({ field: endField }) => (
                                        <FormItem className="flex-1">
                                          <FormControl>
                                            <Select
                                              value={endField.value}
                                              onValueChange={endField.onChange}
                                            >
                                              <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select end time" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {timeOptions.map((time) => (
                                                  <SelectItem
                                                    key={time}
                                                    value={time}
                                                  >
                                                    {time}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                ))}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <FormField
                  control={form.control}
                  name="sessionPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="e.g. 15.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sessionTags"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2">
                        <FormLabel>Tags</FormLabel>

                        {sessionTags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {sessionTags.map((tag) => (
                              <div
                                key={tag}
                                className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                              >
                                <span>{tag}</span>
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag)}
                                  className="text-blue-600 hover:text-blue-800 ml-1"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-2">
                          <FormControl>
                            <Input
                              type="text"
                              value={newTag}
                              placeholder="e.g. Tag 1, Tag 2"
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addTag(e);
                                }
                              }}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            size={"icon"}
                            onClick={(e) => addTag(e)}
                            disabled={!newTag.trim()}
                          >
                            <Plus />
                          </Button>
                        </div>
                      </div>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  className="w-full sm:w-auto order-2 sm:order-1"
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  className={cn(
                    "w-full sm:w-auto order-1 sm:order-2",
                    isLoading && "opacity-50"
                  )}
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Session"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}


