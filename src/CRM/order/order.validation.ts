import { z } from "zod";

const orderItemSchema = z.object({
  variant_id: z.string().trim().min(1, "Variant ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

const shippingAddressSchema = z.object({
  name: z.string().trim().min(1, "Recipient name is required"),
  phone: z.string().trim().min(1, "Recipient phone is required"),
  email: z.string().trim().email("Invalid email").nullable().default(null),
  address: z.string().trim().min(1, "Address is required"),
  city: z.string().trim().min(1, "City is required"),
  zip: z.string().trim().nullable().default(null),
});

export const createOrderSchema = z.object({
  // customer identification
  phone: z.string().trim().min(1, "Customer phone is required"),
  name: z.string().trim().min(1, "Customer name is required"),
  email: z.string().trim().email("Invalid email").nullable().default(null),

  // order items
  items: z.array(orderItemSchema).min(1, "At least one item is required"),

  // delivery
  shipping_address: shippingAddressSchema,

  // financials
  discount_amount: z.number().min(0).default(0),
  tax_amount: z.number().min(0).default(0),
  shipping_charge: z.number().min(0).default(0),
  paid_amount: z.number().min(0).default(0),

  payment_method: z
    .enum(["cash", "card", "mobile_banking", "online"])
    .nullable()
    .default(null),

  note: z.string().trim().nullable().default(null),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.string().trim().min(1, "Order ID is required"),
  }),
  body: z.object({
    order_status: z.enum([
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ]),
  }),
});

export const updatePaymentParam = z.object({
  id: z.string().trim().min(1, "Order ID is required"),
});

export const updatePaymentInput = z.object({
  paid_amount: z.number().min(1, "Paid amount must be greater than 0"),
  payment_method: z.enum(["cash", "card", "mobile_banking", "online"]),
});

export const getOrderListSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    order_status: z
      .enum(["pending", "processing", "shipped", "delivered", "cancelled"])
      .optional(),
    payment_status: z.enum(["unpaid", "partial", "paid"]).optional(),
    customer_id: z.string().optional(),
    search: z.string().optional(), // search by order_number
  }),
});

export type TCreateOrderInput = z.infer<typeof createOrderSchema>;
export type TUpdatePaymentInput = z.infer<typeof updatePaymentInput>;
