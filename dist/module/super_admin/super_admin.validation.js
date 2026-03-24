"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(2, "Name must be at least 2 characters"),
    email: zod_1.z.string().email("Please enter a valid email").toLowerCase().trim(),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    role: zod_1.z.enum([
        "super_admin",
        "admin",
        "account",
        "site_management",
        "inventory",
        "sales",
        "report",
    ]),
    company_id: zod_1.z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid company id")
        .optional()
        .nullable(),
    is_active: zod_1.z.boolean().optional(),
    createdBy: zod_1.z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid user id")
        .optional()
        .nullable(),
});
//# sourceMappingURL=super_admin.validation.js.map