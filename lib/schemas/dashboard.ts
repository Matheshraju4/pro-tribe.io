import { z } from "zod";

export const createSessionFormSchema = z
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
    sessionTags: z.array(z.string()).optional(),
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

// Backend schema that accepts date strings and transforms them to Date objects
export const createSessionBackendSchema = z
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
    sessionTags: z.array(z.string()).optional(),
    // Transform date strings to Date objects
    sessionValidity: z.string().transform((str) => new Date(str)),
    sessionDate: z
      .string()
      .transform((str) => new Date(str))
      .optional(),
    sessionStartDate: z
      .string()
      .transform((str) => new Date(str))
      .optional(),
    sessionEndDate: z
      .string()
      .transform((str) => new Date(str))
      .optional(),

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



  export const createPublicPageFormSchema = z.object({
    BusinessLogo: z.string().optional(),
    BusinessBanner: z.string().optional(),
    BusinessName: z.string().min(1, "Business name is required"),
    BusinessShortDescription: z.string().optional(),
    BannerHeading: z.string().optional(),
    BannerSubHeading: z.string().optional(),
    YearsOfExperience: z.string().optional(),
    HappyClients: z.string().optional(),
    BusinessDescription: z.string().optional(),
    Programs: z.string().optional(),
    uniqueUrl: z.string().min(1, "Unique URL is required"),
    BusinessEmail: z.string().optional(),
    BusinessPhone: z.string().optional(),
    CustomWebsiteUrl: z.string().optional(),
    BusinessAddress: z.string().optional(),
    BusinessCity: z.string().optional(),
  });

 