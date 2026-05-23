"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseQuerySchema = exports.purchaseParamsSchema = exports.updatePurchaseSchema = exports.createPurchaseSchema = void 0;
// src/module/purchase/purchase.validation.ts
const zod_1 = require("zod");
const mongoId = zod_1.z
    .string()
    .trim()
    .regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");
// helper — reuse for all optional mongoId fields
const optionalEmail = zod_1.z
    .string().email("Invalid email").trim()
    .optional()
    .or(zod_1.z.literal("").transform(() => undefined))
    .or(zod_1.z.null().transform(() => undefined));
const optionalMongoId = mongoId
    .optional()
    .or(zod_1.z.literal("").transform(() => undefined))
    .or(zod_1.z.null().transform(() => undefined));
const optionalString = zod_1.z.string().trim()
    .optional()
    .or(zod_1.z.literal("").transform(() => undefined))
    .or(zod_1.z.null().transform(() => undefined));
// ─── Create ───────────────────────────────────────────────────────────────────
const purchaseItemSchema = zod_1.z
    .object({
    product_name: optionalString,
    productId: optionalMongoId,
    categoryId: optionalMongoId,
    categoryName: optionalString,
    color: zod_1.z.string().trim().min(1, "Color is required"),
    size: zod_1.z.string().trim().optional().default(""),
    unit_price: zod_1.z.number({ error: "Unit price is required" }).min(0),
    selling_price: zod_1.z.number({ error: "Selling price is required" }).min(0),
    quantity: zod_1.z.number().int().positive("Quantity must be a positive integer"),
    images: zod_1.z.array(zod_1.z.string().url()).optional().default([]),
    low_stock_alert: zod_1.z.coerce.number().int().min(0).optional().default(0),
})
    .superRefine((data, ctx) => {
    if (!data.productId || data.productId.trim() === "") {
        if (!data.product_name || data.product_name.trim() === "") {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["ProductName"],
                message: "Product Name is required",
            });
        }
    }
    if (!data.categoryId || data.categoryId?.trim() === "") {
        if (!data.categoryName || data.categoryName.trim() === "") {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["categoryName"],
                message: "Category Name is required",
            });
        }
    }
});
exports.createPurchaseSchema = zod_1.z
    .object({
    vendor_id: optionalMongoId,
    vendorName: optionalString,
    vendorPhone: optionalString,
    vendorEmail: optionalEmail,
    purchase_date: zod_1.z
        .string()
        .trim()
        .date("Must be a valid date YYYY-MM-DD")
        .optional(),
    paid_amount: zod_1.z.coerce.number().min(0).optional().default(0),
    note: zod_1.z.string().trim().max(2000).optional(),
    items: zod_1.z
        .array(purchaseItemSchema)
        .min(1, "At least one item is required")
        .max(500, "Maximum 500 items per purchase"),
})
    .superRefine((data, ctx) => {
    if (!data.vendor_id || data.vendor_id.trim() === "") {
        if (!data.vendorName || data.vendorName.trim() === "") {
            ctx.addIssue({
                code: zod_1.z.ZodIssueCode.custom,
                path: ["vendorName"],
                message: "Vendor name is required when vendor is not selected",
            });
        }
    }
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