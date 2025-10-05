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
import type { CalendarEvent } from "@/components/event-calendar";

interface AppointmentDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
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

export function AppointmentDialog({
  event,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: AppointmentDialogProps) {
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

  // Fetch clients and sessions when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchClients();
      fetchSessions();
    }
  }, [isOpen]);

  // Populate form when editing an existing event
  useEffect(() => {
    if (event && isOpen) {
      // Extract appointment data from calendar event
      // We'll need to reverse-engineer the appointment data from the calendar event
      // This is a simplified approach - in a real app, you might store appointment ID in the event
      form.reset({
        appointmentName: event.title.split(" - ")[0] || "",
        appointmentDescription: event.description || "",
        appointmentLocation: event.location || "",
        appointpaidStatus: "Unpaid", // Default since we can't determine from event
        status: "Scheduled",
        clientId: "", // Would need to be extracted from event data
        sessionId: "none",
        duration: "30",
        appointmentPrice: "",
      });

      // Set date and time from event
      const startDate = new Date(event.start);
      const endDate = new Date(event.end);

      form.setValue("appointmentDate", startDate);
      form.setValue("startTime", formatTimeForSelect(startDate));
      form.setValue("endTime", formatTimeForSelect(endDate));
    } else if (isOpen && !event) {
      // Reset form for new appointment
      form.reset({
        appointmentName: "",
        appointmentDescription: "",
        appointmentLocation: "",
        appointpaidStatus: "Unpaid",
        status: "Scheduled",
        clientId: "",
        sessionId: "none",
        duration: "30",
        appointmentPrice: "",
      });

      // Set default date and time
      const now = new Date();
      form.setValue("appointmentDate", now);
      form.setValue("startTime", formatTimeForSelect(now));
      form.setValue(
        "endTime",
        formatTimeForSelect(new Date(now.getTime() + 60 * 60 * 1000))
      ); // +1 hour
    }
  }, [event, isOpen, form]);

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

  // Format date to time string for select inputs
  const formatTimeForSelect = (date: Date): string => {
    return format(date, "hh:mm a");
  };

  // Convert time string to Date object
  const timeStringToDate = (timeStr: string, baseDate: Date): Date => {
    const [time, period] = timeStr.split(" ");
    const [hours, minutes] = time.split(":").map(Number);

    let hour24 = hours;
    if (period === "PM" && hours !== 12) hour24 += 12;
    if (period === "AM" && hours === 12) hour24 = 0;

    const newDate = new Date(baseDate);
    newDate.setHours(hour24, minutes, 0, 0);
    return newDate;
  };

  async function onSubmit(data: AppointmentFormValues) {
    try {
      setIsSubmitting(true);

      // Convert "none" to null for sessionId
      const submitData = {
        ...data,
        sessionId: data.sessionId === "none" ? null : data.sessionId,
      };

      let response;
      if (event?.id) {
        // Update existing appointment
        response = await axios.put("/api/appointments", {
          id: event.id,
          ...submitData,
        });
      } else {
        // Create new appointment
        response = await axios.post("/api/appointments", submitData);
      }

      if (response.data.success) {
        // Transform the created/updated appointment back to calendar event format
        const appointment = response.data.appointment;
        const calendarEvent: CalendarEvent = {
          id: appointment.id,
          title: `${
            appointment.session?.sessionName || appointment.appointmentName
          } - ${
            appointment.client
              ? `${appointment.client.firstName} ${appointment.client.lastName}`
              : "No Client"
          }`,
          description:
            appointment.appointmentDescription ||
            appointment.session?.sessionDescription,
          start: timeStringToDate(
            appointment.startTime,
            new Date(appointment.appointmentDate)
          ),
          end: timeStringToDate(
            appointment.endTime,
            new Date(appointment.appointmentDate)
          ),
          location: appointment.appointmentLocation,
          color:
            appointment.status === "Cancelled"
              ? "rose"
              : appointment.status === "Completed"
              ? "emerald"
              : appointment.appointpaidStatus === "Paid"
              ? "sky"
              : "amber",
        };

        onSave(calendarEvent);
        form.reset();
        onClose();
      } else {
        alert(
          "Failed to save appointment: " +
            (response.data.error || "Unknown error")
        );
      }
    } catch (error: any) {
      console.error("Failed to save appointment:", error);
      if (error.response) {
        alert(
          "Failed to save appointment: " +
            (error.response.data.error || "Server error")
        );
      } else {
        alert("Failed to save appointment: Network error");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

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

  const handleDelete = async () => {
    if (event?.id) {
      try {
        setIsSubmitting(true);
        const response = await axios.delete(`/api/appointments?id=${event.id}`);

        if (response.data.success) {
          onDelete(event.id);
          onClose();
        } else {
          alert(
            "Failed to delete appointment: " +
              (response.data.error || "Unknown error")
          );
        }
      } catch (error: any) {
        console.error("Failed to delete appointment:", error);
        if (error.response) {
          alert(
            "Failed to delete appointment: " +
              (error.response.data.error || "Server error")
          );
        } else {
          alert("Failed to delete appointment: Network error");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {event?.id ? "Edit Appointment" : "Create Appointment"}
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <NormalLoader />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      <Input
                        placeholder="Enter appointment description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Date and Time Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
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
                            disabled={(date) => date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Start Time</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Auto-calculate end time
                          const endTime = calculateEndTime(
                            value,
                            selectedDuration
                          );
                          form.setValue("endTime", endTime);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
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
                    <FormItem className="w-full">
                      <FormLabel>End Time</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
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

              {/* Location and Duration Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="appointmentLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedDuration(value);
                          // Recalculate end time
                          const startTime = form.getValues("startTime");
                          if (startTime) {
                            const endTime = calculateEndTime(startTime, value);
                            form.setValue("endTime", endTime);
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Price and Status Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="appointmentPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter price" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appointpaidStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Paid">Paid</SelectItem>
                          <SelectItem value="Unpaid">Unpaid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <div>
                  {event?.id && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isSubmitting}
                    >
                      Delete
                    </Button>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Saving..."
                      : event?.id
                      ? "Update"
                      : "Create"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
