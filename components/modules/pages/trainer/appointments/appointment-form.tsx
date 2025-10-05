"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  appointmentFormSchema,
  AppointmentFormValues,
} from "@/lib/schemas/appointment";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import axios from "axios";
import { NormalLoader } from "@/components/modules/general/loader";

interface AppointmentFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

interface Session {
  id: string;
  sessionName: string;
  sessionDescription?: string;
  sessionDuration?: string;
  sessionPrice?: string;
  sessionType: string;
}

export function AppointmentForm({
  open,
  onOpenChange,
  onSuccess,
}: AppointmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<string>("30");

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      appointmentName: "",
      appointmentDescription: "",
      appointmentLocation: "",
      appointpaidStatus: "Unpaid",
      status: "Scheduled",
      clientId: "",
      sessionId: "none",
      duration: "30",
      appointmentPrice: "",
    },
  });

  // Fetch clients and sessions when component mounts
  useEffect(() => {
    if (open) {
      fetchClients();
      fetchSessions();
    }
  }, [open]);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/appointments/clients");
      if (response.data.success) {
        setClients(response.data.clients);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await axios.get("/api/appointments/sessions");
      if (response.data.success) {
        setSessions(response.data.sessions);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    }
  };

  // Function to calculate end time based on start time and duration
  const calculateEndTime = (startTime: string, duration: string) => {
    if (!startTime || !duration) return "";

    const [time, period] = startTime.split(" ");
    const [hours, minutes] = time.split(":").map(Number);

    let totalMinutes = hours * 60 + minutes;
    if (period === "PM" && hours !== 12) totalMinutes += 12 * 60;
    if (period === "AM" && hours === 12) totalMinutes -= 12 * 60;

    totalMinutes += parseInt(duration);

    let endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;

    let endPeriod = "AM";
    if (endHours >= 12) {
      endPeriod = "PM";
      if (endHours > 12) endHours -= 12;
    }
    if (endHours === 0) endHours = 12;

    return `${endHours}:${endMinutes.toString().padStart(2, "0")} ${endPeriod}`;
  };

  // Debug function to check form state
  const debugFormState = () => {
    console.log("=== FORM DEBUG INFO ===");
    console.log("Form values:", form.getValues());
    console.log("Form errors:", form.formState.errors);
    console.log("Form is valid:", form.formState.isValid);
    console.log("Form is dirty:", form.formState.isDirty);
    console.log("Form is submitting:", form.formState.isSubmitting);
    console.log("=========================");
  };

  async function onSubmit(data: AppointmentFormValues) {
    console.log("🚀 onSubmit function called!");
    console.log("Form data being submitted:", data);

    try {
      setIsSubmitting(true);

      // Convert "none" to null for sessionId
      const submitData = {
        ...data,
        sessionId: data.sessionId === "none" ? null : data.sessionId,
      };

      console.log("Data being sent to API:", submitData);

      const response = await axios.post("/api/appointments", submitData);

      if (response.data.success) {
        console.log(
          "Appointment created successfully:",
          response.data.appointment
        );
        form.reset();
        onOpenChange?.(false);
        onSuccess?.(); // Call the success callback to refresh the list
        alert("Appointment created successfully!");
      } else {
        console.error("API returned error:", response.data);
        alert(
          "Failed to create appointment: " +
            (response.data.error || "Unknown error")
        );
      }
    } catch (error: any) {
      console.error("Failed to create appointment:", error);
      if (error.response) {
        console.error("Error response:", error.response.data);
        alert(
          "Failed to create appointment: " +
            (error.response.data.error || "Server error")
        );
      } else {
        alert("Failed to create appointment: Network error");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Function to handle form submission with validation check
  const handleFormSubmit = () => {
    console.log("🔍 Submit button clicked!");
    debugFormState();

    // Manually trigger form validation
    form.handleSubmit(
      (data) => {
        console.log("✅ Form validation passed, calling onSubmit");
        onSubmit(data);
      },
      (errors) => {
        console.log("❌ Form validation failed:", errors);
        alert(
          "Please fix the form errors before submitting. Check console for details."
        );
      }
    )();
  };

  const timeSlots = [
    "08:00 AM",
    "08:30 AM",
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Create appointment
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <NormalLoader />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                console.log("📝 Form submit event triggered");
                handleFormSubmit();
              }}
              className="space-y-4"
            >
              {/* Client and Session Selection Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Client Name</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.firstName} {client.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Session Selection */}
                <FormField
                  control={form.control}
                  name="sessionId"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Session (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select session" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No session</SelectItem>
                          {sessions.map((session) => (
                            <SelectItem key={session.id} value={session.id}>
                              {session.sessionName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Appointment Name */}
              <FormField
                control={form.control}
                name="appointmentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter appointment name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Appointment Description */}
              <FormField
                control={form.control}
                name="appointmentDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Appointment Price */}
              <FormField
                control={form.control}
                name="appointmentPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter price (e.g., $50)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date Selection */}
              <FormField
                control={form.control}
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Select date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Auto-calculate end time if duration is selected
                          const duration = form.getValues("duration");
                          if (duration) {
                            const endTime = calculateEndTime(value, duration);
                            form.setValue("endTime", endTime);
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                      <Select onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Appointment Price */}
              <FormField
                control={form.control}
                name="appointmentLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Appointment Location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange?.(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  onClick={(e) => {
                    console.log("🎯 Submit button onClick triggered");
                    e.preventDefault();
                    handleFormSubmit();
                  }}
                >
                  {isSubmitting ? "Creating..." : "Create Appointment"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
