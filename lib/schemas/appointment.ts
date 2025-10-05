import { z } from "zod";

export const appointmentFormSchema = z.object({
  appointmentName: z.string().min(1, "Appointment name is required"),
  appointmentDescription: z.string().optional(),
  appointmentDate: z.date({
    required_error: "Appointment date is required",
  }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  appointmentLocation: z.string().min(1, "Location is required"),
  appointmentPrice: z.string().optional(),
  clientId: z.string().min(1, "Please select a client"),
  sessionId: z.string().optional(),
  appointpaidStatus: z.enum(["Paid", "Unpaid"]),
  status: z.enum(["Scheduled", "Cancelled", "Completed"]),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

// Backend schema that accepts date strings and transforms them to Date objects
export const createAppointmentBackendSchema = z.object({
  appointmentName: z.string().min(1, "Appointment name is required"),
  appointmentDescription: z.string().optional(),
  appointmentDate: z.string().transform((str) => new Date(str)),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  appointmentLocation: z.string().min(1, "Location is required"),
  appointmentPrice: z.string().optional(),
  clientId: z.string().min(1, "Please select a client"),
  sessionId: z.string().optional(),
  appointpaidStatus: z.enum(["Paid", "Unpaid"]).default("Unpaid"),
  status: z.enum(["Scheduled", "Cancelled", "Completed"]).default("Scheduled"),
});

export type CreateAppointmentInput = z.infer<
  typeof createAppointmentBackendSchema
>;
