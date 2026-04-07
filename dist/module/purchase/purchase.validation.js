"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseQuerySchema = exports.purchaseParamsSchema = exports.updatePurchaseSchema = exports.createPurchaseSchema = void 0;
// src/module/purchase/purchase.validation.ts
const zod_1 = require("zod");
const mongoId = zod_1.z
    .string()
    .trim()
    .regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");
// ─── Create ───────────────────────────────────────────────────────────────────
const purchaseItemSchema = zod_1.z.object({
    product_name: zod_1.z.string().trim().min(1, "Product name is required"),
    category: zod_1.z.string().trim().min(1, "Category is required"),
    color: zod_1.z.string().trim().min(1, "Color is required"),
    size: zod_1.z.string().trim().min(1, "Size is required"),
    unit_price: zod_1.z.number({ error: "Unit price is required" }).min(0),
    selling_price: zod_1.z.number({ error: "Selling price is required" }).min(0),
    quantity: zod_1.z.number().int().positive("Quantity must be a positive integer"),
    low_stock_alert: zod_1.z.number().int().min(0).optional().default(5),
});
exports.createPurchaseSchema = zod_1.z.object({
    vendor_id: mongoId,
    purchase_date: zod_1.z
        .string()
        .trim()
        .date("Must be a valid date YYYY-MM-DD")
        .optional(),
    paid_amount: zod_1.z.number().min(0).optional().default(0),
    note: zod_1.z.string().trim().max(2000).optional(),
    items: zod_1.z
        .array(purchaseItemSchema)
        .min(1, "At least one item is required")
        .max(500, "Maximum 500 items per purchase"),
});
exports.updatePurchaseSchema = zod_1.z.object({
    paid_amount: zod_1.z.number().min(0, "Paid amount must be ≥ 0"),
    note: zod_1.z.string().trim().max(2000).optional(),
});
exports.purchaseParamsSchema = zod_1.z.object({ id: mongoId });
exports.purchaseQuerySchema = zod_1.z.object({
    page: zod_1.z
        .string()
        .optional()
        .transform((v) => parseInt(v ?? "1")),
    limit: zod_1.z
        .string()
        .optional()
        .transform((v) => parseInt(v ?? "10")),
    vendor_id: mongoId.optional(),
    status: zod_1.z.enum(["pending", "partial", "paid"]).optional(),
    from_date: zod_1.z
        .string()
        .optional()
        .transform((v) => (v ? new Date(v) : undefined)),
    search: zod_1.z.string().trim().optional(),
    to_date: zod_1.z
        .string()
        .optional()
        .transform((v) => (v ? new Date(v) : undefined)),
    sort_order: zod_1.z.enum(["asc", "desc"]).optional().default("desc"),
    // vendor name
    sort_by: zod_1.z
        .enum(["purchase_date", "total_amount", "due_amount", "createdAt"])
        .default("createdAt"),
});
//# sourceMappingURL=purchase.validation.js.map