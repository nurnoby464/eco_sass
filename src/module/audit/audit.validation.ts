import z from "zod";

export const createCompanySchema = z.object({
  company_name: z
    .string({ error: "Company name is required" })
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(200, "Company name cannot exceed 200 characters"),

  company_email: z.email("Please enter a valid email").toLowerCase().trim(),
  phone: z
    .string({ error: "Phone number is required" })
    .trim()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long")
    .regex(/^\+?[0-9\s\-().]+$/, "Please enter a valid phone number"),
  address: z
    .string({ error: "Address is required" })
    .trim()
    .min(5, "Address must be at least 5 characters")
    .max(500, "Address cannot exceed 500 characters"),

  logo: z.string().url("Logo must be a valid URL").nullable().optional(),

  domain: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/,
      "Please enter a valid domain (e.g. fashionzone.com.bd)",
    )
    .nullable()
    .optional(),

  subdomain: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9-]+$/,
      "Subdomain can only contain lowercase letters, numbers and hyphens",
    )
    .min(2, "Subdomain must be at least 2 characters")
    .max(63, "Subdomain cannot exceed 63 characters")
    .nullable()
    .optional(),
  status: z
    .enum(["active", "inactive", "suspended"], {
      message: "Invalid status value",
    })
    .default("active"),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
