import { z } from "zod";
export declare const createUserSchema: z.ZodObject<{
    name: z.ZodString;
    email: z.ZodString;
    password: z.ZodString;
    role: z.ZodEnum<{
        super_admin: "super_admin";
        admin: "admin";
        account: "account";
        site_management: "site_management";
        inventory: "inventory";
        sales: "sales";
        report: "report";
    }>;
    company_id: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    is_active: z.ZodOptional<z.ZodBoolean>;
    createdBy: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
//# sourceMappingURL=super_admin.validation.d.ts.map