"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderListSchema = exports.updatePaymentInput = exports.updatePaymentParam = exports.updateOrderStatusSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
const orderItemSchema = zod_1.z.object({
    variant_id: zod_1.z.string().trim().min(1, "Variant ID is required"),
    quantity: zod_1.z.number().int().min(1, "Quantity must be at least 1"),
});
const shippingAddressSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1, "Recipient name is required"),
    phone: zod_1.z.string().trim().min(1, "Recipient phone is required"),
    email: zod_1.z.string().trim().email("Invalid email").nullable().default(null),
    address: zod_1.z.string().trim().min(1, "Address is required"),
    city: zod_1.z.string().trim().min(1, "City is required"),
    zip: zod_1.z.string().trim().nullable().default(null),
});
exports.createOrderSchema = zod_1.z.object({
    // customer identification
    phone: zod_1.z.string().trim().min(1, "Customer phone is required"),
    name: zod_1.z.string().trim().min(1, "Customer name is required"),
    email: zod_1.z.string().trim().email("Invalid email").nullable().default(null),
    // order items
    items: zod_1.z.array(orderItemSchema).min(1, "At least one item is required"),
    // delivery
    shipping_address: shippingAddressSchema,
    // financials
    discount_amount: zod_1.z.number().min(0).default(0),
    tax_amount: zod_1.z.number().min(0).default(0),
    shipping_charge: zod_1.z.number().min(0).default(0),
    paid_amount: zod_1.z.number().min(0).default(0),
    payment_method: zod_1.z
        .enum(["cash", "card", "mobile_banking", "online"])
        .nullable()
        .default(null),
    note: zod_1.z.string().trim().nullable().default(null),
});
exports.updateOrderStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().trim().min(1, "Order ID is required"),
    }),
    body: zod_1.z.object({
        order_status: zod_1.z.enum([
            "pending",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
        ]),
    }),
});
exports.updatePaymentParam = zod_1.z.object({
    id: zod_1.z.string().trim().min(1, "Order ID is required"),
});
exports.updatePaymentInput = zod_1.z.object({
    paid_amount: zod_1.z.number().min(1, "Paid amount must be greater than 0"),
    payment_method: zod_1.z.enum(["cash", "card", "mobile_banking", "online"]),
});
exports.getOrderListSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional(),
        order_status: zod_1.z
            .enum(["pending", "processing", "shipped", "delivered", "cancelled"])
            .optional(),
        payment_status: zod_1.z.enum(["unpaid", "partial", "paid"]).optional(),
        customer_id: zod_1.z.string().optional(),
        search: zod_1.z.string().optional(), // search by order_number
    }),
});
//# sourceMappingURL=order.validation.js.map