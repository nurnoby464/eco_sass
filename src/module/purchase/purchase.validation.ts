// src/module/purchase/purchase.validation.ts
import { z } from "zod";
import mongoose from "mongoose";

const mongoId = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

// ─── Create ───────────────────────────────────────────────────────────────────

const purchaseItemSchema = z.object({
  product_name: z.string().trim().min(1, "Product name is required"),
  category: z.string().trim().min(1, "Category is required"),
  color: z.string().trim().min(1, "Color is required"),
  size: z.string().trim().min(1, "Size is required"),
  unit_price: z.number({ error: "Unit price is required" }).min(0),
  selling_price: z.number({ error: "Selling price is required" }).min(0),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  low_stock_alert: z.number().int().min(0).optional().default(5),
});

export const createPurchaseSchema = z.object({
  vendor_id: mongoId,
  purchase_date: z
    .string()
    .trim()
    .date("Must be a valid date YYYY-MM-DD")
    .optional(),
  paid_amount: z.number().min(0).optional().default(0),
  note: z.string().trim().max(2000).optional(),
  items: z
    .array(purchaseItemSchema)
    .min(1, "At least one item is required")
    .max(500, "Maximum 500 items per purchase"),
});

export const updatePurchaseSchema = z.object({
  paid_amount: z.number().min(0, "Paid amount must be ≥ 0"),
  note: z.string().trim().max(2000).optional(),
});
export const purchaseParamsSchema = z.object({ id: mongoId });

export const purchaseQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => parseInt(v ?? "1")),
  limit: z
    .string()
    .optional()
    .transform((v) => parseInt(v ?? "10")),

  vendor_id: mongoId.optional(),
  status: z.enum(["pending", "partial", "paid"]).optional(),
  from_date: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : undefined)),
  search: z.string().trim().optional(),
  to_date: z
    .string()
    .optional()
    .transform((v) => (v ? new Date(v) : undefined)),
  sort_order: z.enum(["asc", "desc"]).optional().default("desc"),
  // vendor name
  sort_by: z
    .enum(["purchase_date", "total_amount", "due_amount", "createdAt"])
    .default("createdAt"),
});
export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type PurchaseItemInput   = z.infer<typeof purchaseItemSchema>;
export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>;
export type ListPurchaseQuery = z.infer<typeof purchaseQuerySchema>;
