import { z } from "zod";

export const trainerSignupSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
    mobileNumber: z.string().min(10, "Please enter a valid mobile number"),
    businessName: z.string().min(1, "Business name is required"),
    agreeToTerms: z
      .boolean()
      .refine((val) => val === true, "You must agree to the terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Type for the validated data (without confirmPassword)
export type TrainerSignupInput = Omit<
  z.infer<typeof trainerSignupSchema>,
  "confirmPassword"
>;

// Schema for backend validation (without confirmPassword)
export const trainerSignupBackendSchema = trainerSignupSchema.omit({
  confirmPassword: true,
  agreeToTerms: true,
});

export const trainerLoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"), // Changed from min(8) to min(1)
  rememberMe: z.boolean().optional(),
});

export type TrainerLoginInput = z.infer<typeof trainerLoginSchema>;

export const trainerLoginBackendSchema = trainerLoginSchema;
