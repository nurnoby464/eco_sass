import { z } from "zod";
import { createNewCompanySchema } from "../company/company.validation";

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email").toLowerCase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum([
    "super_admin",
    "admin",
    "account",
    "site_management",
    "inventory",
    "sales",
    "report",
  ]),
  company_id: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid company id")
    .optional()
    .nullable(),
  is_active: z.boolean().optional(),
  createdBy: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid user id")
    .optional()
    .nullable(),
});

export const registerCustomerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email").toLowerCase().trim(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "Invalid Bangladeshi phone number")
    .nullable()
    .optional(),
});
export const checkoutSchema = z.object({
  body: z.object({
    phone: z
      .string()
      .regex(/^01[3-9]\d{8}$/, "Phone number is required for checkout"),
    // ...rest of sale fields
  }),
});
export type RegisterCustomerInput = z.infer<typeof registerCustomerSchema>;
// ─── Derive the type from the schema ─────────────────────
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateNewCompanyInput = z.infer<typeof createNewCompanySchema>;
