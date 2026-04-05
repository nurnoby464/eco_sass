// src/module/product/product.validation.ts
import { z } from "zod";
import mongoose from "mongoose";

const objectId = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

const attributeSchema = z.object({
  key: z.string().trim().min(1, "Attribute key is required"),
  value: z.string().trim().min(1, "Attribute value is required"),
});

// ─── Product ──────────────────────────────────────────────
export const createProductSchema = z.object({
  category_id: objectId,
  vendor_id: objectId,
  name: z
    .string()
    .trim()
    .min(2, "Min 2 characters")
    .max(200, "Max 200 characters"),
  description: z.string().trim().nullable(),
  images: z.array(z.string().trim().url()).optional().default([]),
  sku: z.string().trim().min(1, "SKU is required").toUpperCase(),
  buying_price: z.number({ error: "Buying price is required" }).min(0),
  selling_price: z.number({ error: "Selling price is required" }).min(0),
  stock: z.number().min(0).optional().default(0),
  low_stock_alert: z.number().min(0).optional().default(10),
  has_variants: z.boolean().optional().default(false),
});

export const updateProductSchema = z.object({
  // category_id   : objectId.optional(),
  // vendor_id     : objectId.optional(),
  name: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().optional().nullable(),
  images: z.array(z.string().trim().url()).optional(),
  buying_price: z.number().min(0).optional(),
  selling_price: z.number().min(0).optional(),
  stock: z.number().min(0).optional(),
  low_stock_alert: z.number().min(0).optional(),
  is_active: z.boolean().optional(),
});

// ─── Variant ──────────────────────────────────────────────

// ─── Params ───────────────────────────────────────────────
export const productParamsSchema = z.object({
  id: objectId,
});

// ─── Query ────────────────────────────────────────────────
export const productQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => parseInt(v ?? "1")),
  limit: z
    .string()
    .optional()
    .transform((v) => parseInt(v ?? "10")),
  search: z.string().trim().optional(),
  category_id: objectId.optional(),
  vendor_id: objectId.optional(),
  has_variants: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  is_active: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  low_stock: z.enum(["true"]).optional(), // ?low_stock=true → filter stock <= alert
  sort_by: z
    .enum(["name", "createdAt", "stock", "selling_price"])
    .optional()
    .default("createdAt"),
  sort_order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductQuery = z.infer<typeof createProductSchema>;
