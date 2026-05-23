import { z } from "zod";
export declare const createOrderBody: z.ZodObject<{
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
        cash_on_delivery: "cash_on_delivery";
        card: "card";
        mobile_banking: "mobile_banking";
        credit: "credit";
        online: "online";
    }>>>;
    note: z.ZodDefault<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const updateOrderStatusParam: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const updateOrderStatusBody: z.ZodObject<{
    order_status: z.ZodEnum<{
        pending: "pending";
        cancelled: "cancelled";
        processing: "processing";
        shipped: "shipped";
        delivered: "delivered";
    }>;
}, z.core.$strip>;
export declare const updatePaymentParam: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const updatePaymentBody: z.ZodObject<{
    paid_amount: z.ZodNumber;
    payment_method: z.ZodEnum<{
        cash: "cash";
        card: "card";
        mobile_banking: "mobile_banking";
        online: "online";
    }>;
}, z.core.$strip>;
export declare const getOrderListQuery: z.ZodObject<{
    page: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    limit: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    orderStatus: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>, z.ZodEnum<{
        pending: "pending";
        cancelled: "cancelled";
        processing: "processing";
        shipped: "shipped";
        delivered: "delivered";
    }>>>;
    paymentStatus: z.ZodOptional<z.ZodEnum<{
        partial: "partial";
        paid: "paid";
        unpaid: "unpaid";
    }>>;
    customerId: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<{
        name: "name";
        createdAt: "createdAt";
        stock: "stock";
    }>>;
    sortOrder: z.ZodPipe<z.ZodDefault<z.ZodEnum<{
        asc: "asc";
        dsc: "dsc";
    }>>, z.ZodTransform<1 | -1, "asc" | "dsc">>;
}, z.core.$strip>;
export declare const getOrderByIdParam: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export type TCreateOrderInput = z.infer<typeof createOrderBody>;
export type TUpdateOrderStatusInput = z.infer<typeof updateOrderStatusBody>;
export type TUpdatePaymentInput = z.infer<typeof updatePaymentBody>;
export type TGetOrderListQuery = z.infer<typeof getOrderListQuery>;
//# sourceMappingURL=order.validation.d.ts.map