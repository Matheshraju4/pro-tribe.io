import { z } from "zod";

export const createPackageFormSchema = z.object({
  packageName: z
    .string()
    .min(1, "Package name is required")
    .min(3, "Package name must be at least 3 characters")
    .max(100, "Package name must be less than 100 characters"),

  packageDescription: z
    .string()
    .min(1, "Package description is required")
    .min(10, "Package description must be at least 10 characters")
    .max(500, "Package description must be less than 500 characters"),

  packagePrice: z
    .string()
    .min(1, "Package price is required")
    .regex(/^\d+(\.\d{1,2})?$/, "Please enter a valid price (e.g., 99.99)")
    .refine((val) => parseFloat(val) > 0, "Price must be greater than 0"),

  packageDiscount: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val === "") return true; // Optional field
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 100;
    }, "Discount must be between 0 and 100"),

  validDays: z
    .string()
    .min(1, "Validity period is required")
    .regex(/^\d+$/, "Please enter a valid number of days")
    .refine((val) => parseInt(val) > 0, "Validity must be at least 1 day")
    .refine((val) => parseInt(val) <= 365, "Validity cannot exceed 365 days"),
});

// Type for the validated data
export type CreatePackageInput = z.infer<typeof createPackageFormSchema>;

// Backend schema (same as form schema for packages)
export const createPackageBackendSchema = createPackageFormSchema.extend({
  selectedSession: z.array(z.string()),
});

// Update schema for editing existing packages
export const updatePackageFormSchema = createPackageFormSchema
  .partial()
  .extend({
    id: z.string().min(1, "Package ID is required"),
  });

export type UpdatePackageInput = z.infer<typeof updatePackageFormSchema>;
