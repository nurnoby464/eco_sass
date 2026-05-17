import { z } from "zod";
export declare const createOrderSchema: z.ZodObject<{
    phone: z.ZodString;
    name: z.ZodString;
    email: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    items: z.ZodArray<z.ZodObject<{
        variant_id: z.ZodString;
        quantity: z.ZodNumber;
    }, z.core.$strip>>;
    shipping_address: z.ZodObject<{
        name: z.ZodString;
        phone: z.ZodString;
        email: z.ZodDefault<z.ZodNullable<z.ZodString>>;
        address: z.ZodString;
        city: z.ZodString;
        zip: z.ZodDefault<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>;
    discount_amount: z.ZodDefault<z.ZodNumber>;
    tax_amount: z.ZodDefault<z.ZodNumber>;
    shipping_charge: z.ZodDefault<z.ZodNumber>;
    paid_amount: z.ZodDefault<z.ZodNumber>;
    payment_method: z.ZodDefault<z.ZodNullable<z.ZodEnum<{
        cash: "cash";
        card: "card";
        mobile_banking: "mobile_banking";
        online: "online";
    }>>>;
    note: z.ZodDefault<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const updateOrderStatusSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
    body: z.ZodObject<{
        order_status: z.ZodEnum<{
            pending: "pending";
            cancelled: "cancelled";
            processing: "processing";
            shipped: "shipped";
            delivered: "delivered";
        }>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updatePaymentParam: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const updatePaymentInput: z.ZodObject<{
    paid_amount: z.ZodNumber;
    payment_method: z.ZodEnum<{
        cash: "cash";
        card: "card";
        mobile_banking: "mobile_banking";
        online: "online";
    }>;
}, z.core.$strip>;
export declare const getOrderListSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
        order_status: z.ZodOptional<z.ZodEnum<{
            pending: "pending";
            cancelled: "cancelled";
            processing: "processing";
            shipped: "shipped";
            delivered: "delivered";
        }>>;
        payment_status: z.ZodOptional<z.ZodEnum<{
            partial: "partial";
            paid: "paid";
            unpaid: "unpaid";
        }>>;
        customer_id: z.ZodOptional<z.ZodString>;
        search: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type TCreateOrderInput = z.infer<typeof createOrderSchema>;
export type TUpdatePaymentInput = z.infer<typeof updatePaymentInput>;
//# sourceMappingURL=order.validation.d.ts.map