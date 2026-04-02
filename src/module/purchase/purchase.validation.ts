// src/module/purchase/purchase.validation.ts
import { z } from "zod";
import mongoose from "mongoose";

const objectId = z
  .string()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId",
  });

const purchaseItemSchema = z.object({
  product_id: objectId,
  variant_id: objectId.nullable().optional().default(null),
  quantity  : z.number({ error: "Quantity is required" }).min(1, "Min quantity is 1"),
  unit_price: z.number({ error: "Unit price is required" }).min(0),
});

export const createPurchaseSchema = z.object({
  vendor_id    : objectId,
  items        : z.array(purchaseItemSchema).min(1, "At least one item is required"),
  paid_amount  : z.number().min(0).optional().default(0),
  purchase_date: z.string().optional().transform((v) => v ? new Date(v) : new Date()),
  note         : z.string().trim().max(500).optional().nullable(),
});

export const purchaseParamsSchema = z.object({
  id: objectId,
});

export const purchaseQuerySchema = z.object({
  page     : z.string().optional().transform((v) => parseInt(v ?? "1")),
  limit    : z.string().optional().transform((v) => parseInt(v ?? "10")),
  vendor_id: objectId.optional(),
  status   : z.enum(["pending", "partial", "paid"]).optional(),
  from_date: z.string().optional().transform((v) => v ? new Date(v) : undefined),
  to_date  : z.string().optional().transform((v) => v ? new Date(v) : undefined),
  sort_order: z.enum(["asc", "desc"]).optional().default("desc"),
});