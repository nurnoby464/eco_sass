"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productQuerySchema = exports.productParamsSchema = exports.updateProductSchema = exports.createProductSchema = void 0;
// src/module/product/product.validation.ts
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const objectId = zod_1.z
    .string()
    .refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
});
const attributeSchema = zod_1.z.object({
    key: zod_1.z.string().trim().min(1, "Attribute key is required"),
    value: zod_1.z.string().trim().min(1, "Attribute value is required"),
});
// ─── Product ──────────────────────────────────────────────
exports.createProductSchema = zod_1.z.object({
    category_id: objectId,
    vendor_id: objectId,
    name: zod_1.z
        .string()
        .trim()
        .min(2, "Min 2 characters")
        .max(200, "Max 200 characters"),
    description: zod_1.z.string().trim().nullable(),
    images: zod_1.z.array(zod_1.z.string().trim().url()).optional().default([]),
    sku: zod_1.z.string().trim().min(1, "SKU is required").toUpperCase(),
    buying_price: zod_1.z.number({ error: "Buying price is required" }).min(0),
    selling_price: zod_1.z.number({ error: "Selling price is required" }).min(0),
    stock: zod_1.z.number().min(0).optional().default(0),
    low_stock_alert: zod_1.z.number().min(0).optional().default(10),
    has_variants: zod_1.z.boolean().optional().default(false),
});
exports.updateProductSchema = zod_1.z.object({
    // category_id   : objectId.optional(),
    // vendor_id     : objectId.optional(),
    name: zod_1.z.string().trim().min(2).max(200).optional(),
    description: zod_1.z.string().trim().optional().nullable(),
    images: zod_1.z.array(zod_1.z.string().trim().url()).optional(),
    buying_price: zod_1.z.number().min(0).optional(),
    selling_price: zod_1.z.number().min(0).optional(),
    stock: zod_1.z.number().min(0).optional(),
    low_stock_alert: zod_1.z.number().min(0).optional(),
    is_active: zod_1.z.boolean().optional(),
});
// ─── Variant ──────────────────────────────────────────────
// ─── Params ───────────────────────────────────────────────
exports.productParamsSchema = zod_1.z.object({
    id: objectId,
});
// ─── Query ────────────────────────────────────────────────
exports.productQuerySchema = zod_1.z.object({
    page: zod_1.z
        .string()
        .optional()
        .transform((v) => parseInt(v ?? "1")),
    limit: zod_1.z
        .string()
        .optional()
        .transform((v) => parseInt(v ?? "10")),
    search: zod_1.z.string().trim().optional(),
    category_id: objectId.optional(),
    vendor_id: objectId.optional(),
    has_variants: zod_1.z
        .enum(["true", "false"])
        .optional()
        .transform((v) => (v === undefined ? undefined : v === "true")),
    is_active: zod_1.z
        .enum(["true", "false"])
        .optional()
        .transform((v) => (v === undefined ? undefined : v === "true")),
    low_stock: zod_1.z.enum(["true"]).optional(), // ?low_stock=true → filter stock <= alert
    sort_by: zod_1.z
        .enum(["name", "createdAt", "stock", "selling_price"])
        .optional()
        .default("createdAt"),
    sort_order: zod_1.z.enum(["asc", "desc"]).optional().default("desc"),
});
//# sourceMappingURL=product.validation.js.map