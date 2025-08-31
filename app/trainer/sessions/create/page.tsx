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
import { useForm, ControllerRenderProps, useWatch } from "react-hook-form";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import TimeSelectCard from "@/components/modules/general/time-select-card";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const createSessionFormSchema = z
  .object({
    sessionName: z.string().min(1, "Session name is required"),
    sessionDescription: z.string().min(1, "Session description is required"),
    sessionDuration: z.string().min(1, "Session duration is required"),
    sessionLocation: z.string().min(1, "Session location is required"),
    sessionType: z.enum(["OneToOne", "Group"]),
    sessionMaxCapacity: z.number().min(1, "Session max capacity is required"),
    sessionFrequency: z.enum(["OneTime", "Recurring"]),
    bufferTime: z.string().min(1, "Buffer time is required"),
    sessionPrice: z.string().min(1, "Session price is required"),
    sessionValidity: z.date().min(new Date(), "Session validity is required"),

    // Make dates conditional based on frequency
    sessionDate: z.date().optional(), // For OneTime
    sessionStartDate: z.date().optional(), // For Recurring
    sessionEndDate: z.date().optional(), // For Recurring

    sessionDateAndTime: z.array(
      z.object({
        selectedDay: z.enum([
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ]),
        startTime: z.string().min(1, "Start time is required"),
        endTime: z.string().min(1, "End time is required"),
      })
    ),
  })
  .refine(
    (data) => {
      // Custom validation: ensure appropriate dates are set based on frequency
      if (data.sessionFrequency === "OneTime") {
        return data.sessionDate != null;
      } else {
        return data.sessionStartDate != null && data.sessionEndDate != null;
      }
    },
    {
      message: "Please provide appropriate dates for the selected frequency",
      path: ["sessionDate", "sessionStartDate", "sessionEndDate"],
    }
  );

type CreateSessionForm = z.infer<typeof createSessionFormSchema>;

export default function CreateSessionPage() {
  const router = useRouter();
  const form = useForm<CreateSessionForm>({
    resolver: zodResolver(createSessionFormSchema),
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

      sessionDateAndTime: [
        {
          selectedDay: "Monday",
          startTime: "",
          endTime: "",
        },
      ],
    },
  });

  const onSubmit = async (data: CreateSessionForm) => {
    console.log("Form data being submitted:", data);
    console.log("Validation result:", createSessionFormSchema.safeParse(data));

    if (createSessionFormSchema.safeParse(data).success) {
      const response = await axios.post(
        "/api/auth/trainer/session/create",
        data
      );
      response.status === 200
        ? toast.success("Session created successfully")
        : toast.error("Failed to create session");
      router.push("/trainer/sessions");
      // TODO: call your API here
    } else {
      console.log(
        "Validation failed:",
        createSessionFormSchema.safeParse(data).error
      );
    }
  };
  const formData = useWatch({
    control: form.control,
  });
  const {
    sessionType,
    sessionMaxCapacity,
    sessionFrequency,
    sessionStartDate,
    sessionEndDate,
    sessionDate,
    sessionPrice,
    sessionDuration,
    sessionLocation,
    sessionDescription,
    sessionName,
    bufferTime,
    sessionDateAndTime,
  } = formData;

  console.log("start date", sessionStartDate);
  console.log("end date", sessionEndDate);
  console.log("session date", sessionDate);

  useEffect(() => {
    if (sessionFrequency === "OneTime") {
      // Reset end date for one-time sessions
      form.setValue("sessionDate", new Date());
    } else if (sessionFrequency === "Recurring") {
      // Ensure both dates are set for recurring sessions
      if (!form.getValues("sessionStartDate")) {
        form.setValue("sessionStartDate", new Date());
      }
      if (!form.getValues("sessionEndDate")) {
        form.setValue("sessionEndDate", new Date());
      }
    }
  }, [sessionFrequency, form]);

  // helper to format Date -> yyyy-MM-dd for input[type=date]
  const toDateInput = (d?: Date | null) => {
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
  };

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hours = String(i).padStart(2, "0");
    return `${hours}:00`;
  });

  const sortDaysInOrder = (days: string[]) => {
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
  };

  const daysOfWeek = [
    { label: "Sunday", value: "Sunday" },
    { label: "Monday", value: "Monday" },
    { label: "Tuesday", value: "Tuesday" },
    { label: "Wednesday", value: "Wednesday" },
    { label: "Thursday", value: "Thursday" },
    { label: "Friday", value: "Friday" },
    { label: "Saturday", value: "Saturday" },
  ];

  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <Card className="w-full max-w-5xl ">
        <CardHeader>
          <CardTitle>Create a new session</CardTitle>
          <CardDescription>
            Provide the details below to create a session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 flex flex-col gap-6 "
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="grid grid-cols-1  gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            className="grid grid-cols-2 gap-3"
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
                <div className="flex flex-col gap-6">
                  <FormField
                    control={form.control}
                    name="sessionFrequency"
                    render={({ field }) => (
                      <FormItem className="max-w-md">
                        <FormLabel>Frequency</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="grid grid-cols-2 gap-3"
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
                    <div className="space-y-6">
                      {/* Date Range Section */}
                      <div className="bg-gray-50 p-6 rounded-lg border">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Session Date Range
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <div className="bg-gray-50 p-6 rounded-lg border">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Select Days of the Week
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          {daysOfWeek.map((day) => (
                            <div
                              key={day.value}
                              className="flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 hover:border-primary/50"
                            >
                              <Checkbox
                                id={day.value}
                                checked={selectedDays.includes(day.value)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedDays([
                                      ...selectedDays,
                                      day.value,
                                    ]);
                                  } else {
                                    setSelectedDays(
                                      selectedDays.filter(
                                        (d) => d !== day.value
                                      )
                                    );
                                  }
                                }}
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              />
                              <label
                                htmlFor={day.value}
                                className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                              >
                                {day.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Time Slots Section */}
                      {selectedDays.length > 0 && (
                        <div className="bg-gray-50 p-6 rounded-lg border">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
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
                                    (form.getValues(
                                      `sessionDateAndTime.${index}.startTime`
                                    ) as string) || ""
                                  }
                                  endTime={
                                    (form.getValues(
                                      `sessionDateAndTime.${index}.endTime`
                                    ) as string) || ""
                                  }
                                  onStartTimeChange={(time) =>
                                    form.setValue(
                                      `sessionDateAndTime.${index}.startTime`,
                                      time
                                    )
                                  }
                                  onEndTimeChange={(time) =>
                                    form.setValue(
                                      `sessionDateAndTime.${index}.endTime`,
                                      time
                                    )
                                  }
                                />
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* No Days Selected Message */}
                      {selectedDays.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg
                              className="w-8 h-8 text-gray-400"
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
                    <div className="grid grid-cols-2  gap-6">
                      <FormField
                        control={form.control}
                        name="sessionDate"
                        render={({ field }) => (
                          <FormItem className="max-w-xs">
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
                                    className="flex items-center gap-4"
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
                                              <SelectTrigger>
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
                                              <SelectTrigger>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                >
                  Reset
                </Button>
                <Button type="submit">Create Session</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
