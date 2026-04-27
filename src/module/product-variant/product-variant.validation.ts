import { z } from "zod";

const mongoId = z
  .string()
  .trim()
  .regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");

const attributeSchema = z.object({
  key: z.string().trim().min(1),
  value: z.string().trim().min(1),
});

export const createVariantSchema = z.object({
  attributes: z
    .array(attributeSchema)
    .min(1, "At least one attribute required"),
  //   sku            : z.string().trim().toUpperCase().optional(),   // auto-generated if omitted
  buying_price: z.number({ error: "Buying price is required" }).min(0),
  selling_price: z.number({ error: "Selling price is required" }).min(0),
  stock: z.number().int().min(0).optional().default(0),
  low_stock_alert: z.number().int().min(0).optional().default(5),
  image: z.string().trim().url("Must be a valid image URL").nullable(),
});

export const updateVariantSchema = z
  .object({
    buying_price: z.number().min(0).optional(),
    selling_price: z.number().min(0).optional(),
    stock: z.number().int().min(0).optional(),
    low_stock_alert: z.number().int().min(0).optional(),
    image: z.string().trim().url().optional(),
    is_active: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, {
    message: "At least one field is required",
  });

export const variantParamsSchema = z.object({ id: mongoId });

export const productVariantParamsSchema = z.object({
  id: mongoId, // product id
  variantId: mongoId,
});

export const productVariantQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => parseInt(v ?? "1")),
  limit: z
    .string()
    .optional()
    .transform((v) => parseInt(v ?? "10")),
  search: z.string().trim().optional(),
  sortOrder: z
    .enum(["asc", "desc"])
    .optional()
    .transform((v) => (v === "asc" ? 1 : -1))
    .default(-1),
  // vendor name
  sortBy: z
    .enum(["purchase_date", "total_amount", "due_amount", "createdAt"])
    .default("createdAt"),
  stock: z.enum(["lowStock", "outOfStock", "reminderStock"]).optional(),
});
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
