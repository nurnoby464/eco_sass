import { z } from "zod";
import { createCompanySchema } from "../company/company.validation";

export const createUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z
    .email("Please enter a valid email")
    .toLowerCase()
    .trim(),
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

// make admin schema.

const adminSchema = createUserSchema
  .omit({
    role: true,
    company_id: true,
    createdBy: true,
    is_active: true,
  })
  .extend({
    role: z.literal("admin").default("admin"),
  });

export const createCompanyWithAdminSchema = z.object({
  company: createCompanySchema,
  admin: adminSchema,
});

// ─── Derive the type from the schema ─────────────────────
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type CreateCompanyWithAdminInput = z.infer<
  typeof createCompanyWithAdminSchema
>;
