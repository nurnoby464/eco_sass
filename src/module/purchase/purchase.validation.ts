// src/module/purchase/purchase.validation.ts
import { z } from "zod";
import mongoose from "mongoose";
const mongoId = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

  // helper — reuse for all optional mongoId fields
const optionalEmail = z
  .string().email("Invalid email").trim()
  .optional()
  .or(z.literal("").transform(() => undefined))
  .or(z.null().transform(() => undefined))

const optionalMongoId = mongoId
  .optional()
  .or(z.literal("").transform(() => undefined))
  .or(z.null().transform(() => undefined))

const optionalString = z.string().trim()
  .optional()
  .or(z.literal("").transform(() => undefined))
  .or(z.null().transform(() => undefined))

// ─── Create ───────────────────────────────────────────────────────────────────

const purchaseItemSchema = z
  .object({
    product_name: optionalString,
    productId: optionalMongoId,
    categoryId: optionalMongoId,
    categoryName:optionalString,
    color: z.string().trim().min(1, "Color is required"),
    size: z.string().trim().optional().default(""),
    unit_price: z.number({ error: "Unit price is required" }).min(0),
    selling_price: z.number({ error: "Selling price is required" }).min(0),
    quantity: z.number().int().positive("Quantity must be a positive integer"),
    low_stock_alert: z.number().int().min(0).optional().default(5),
  })
  .superRefine((data, ctx) => {
    if (!data.productId || data.productId.trim() === "") {
      if (!data.product_name || data.product_name.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ProductName"],
          message: "Product Name is required",
        });
      }
    }
    if (!data.categoryId || data.categoryId?.trim() === "") {
      if (!data.categoryName || data.categoryName.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["categoryName"],
          message: "Category Name is required",
        });
      }
    }
  });

export const createPurchaseSchema = z
  .object({
    vendor_id: optionalMongoId,
    vendorName:optionalString,
    vendorPhone:optionalString,
    vendorEmail: optionalEmail,
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
  })
  .superRefine((data, ctx) => {
    if (!data.vendor_id || data.vendor_id.trim() === "") {
      if (!data.vendorName || data.vendorName.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["vendorName"],
          message: "Vendor name is required when vendor is not selected",
        });
      }
    }
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
export type PurchaseItemInput = z.infer<typeof purchaseItemSchema>;
export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>;
export type ListPurchaseQuery = z.infer<typeof purchaseQuerySchema>;
