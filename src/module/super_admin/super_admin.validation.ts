import z, { email } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email").toLowerCase().trim(),
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
