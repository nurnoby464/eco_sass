import { z } from "zod";
declare const purchaseItemSchema: z.ZodObject<{
    product_name: z.ZodUnion<[z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodPipe<z.ZodLiteral<"">, z.ZodTransform<undefined, "">>]>, z.ZodPipe<z.ZodNull, z.ZodTransform<undefined, null>>]>;
    productId: z.ZodUnion<[z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodPipe<z.ZodLiteral<"">, z.ZodTransform<undefined, "">>]>, z.ZodPipe<z.ZodNull, z.ZodTransform<undefined, null>>]>;
    categoryId: z.ZodUnion<[z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodPipe<z.ZodLiteral<"">, z.ZodTransform<undefined, "">>]>, z.ZodPipe<z.ZodNull, z.ZodTransform<undefined, null>>]>;
    categoryName: z.ZodUnion<[z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodPipe<z.ZodLiteral<"">, z.ZodTransform<undefined, "">>]>, z.ZodPipe<z.ZodNull, z.ZodTransform<undefined, null>>]>;
    color: z.ZodString;
    size: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    unit_price: z.ZodNumber;
    selling_price: z.ZodNumber;
    quantity: z.ZodNumber;
    images: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    low_stock_alert: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
}, z.core.$strip>;
export declare const createPurchaseSchema: z.ZodObject<{
    vendor_id: z.ZodUnion<[z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodPipe<z.ZodLiteral<"">, z.ZodTransform<undefined, "">>]>, z.ZodPipe<z.ZodNull, z.ZodTransform<undefined, null>>]>;
    vendorName: z.ZodUnion<[z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodPipe<z.ZodLiteral<"">, z.ZodTransform<undefined, "">>]>, z.ZodPipe<z.ZodNull, z.ZodTransform<undefined, null>>]>;
    vendorPhone: z.ZodUnion<[z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodPipe<z.ZodLiteral<"">, z.ZodTransform<undefined, "">>]>, z.ZodPipe<z.ZodNull, z.ZodTransform<undefined, null>>]>;
    vendorEmail: z.ZodUnion<[z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodPipe<z.ZodLiteral<"">, z.ZodTransform<undefined, "">>]>, z.ZodPipe<z.ZodNull, z.ZodTransform<undefined, null>>]>;
    purchase_date: z.ZodOptional<z.ZodString>;
    paid_amount: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    note: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        product_name: z.ZodUnion<[z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodPipe<z.ZodLiteral<"">, z.ZodTransform<undefined, "">>]>, z.ZodPipe<z.ZodNull, z.ZodTransform<undefined, null>>]>;
        productId: z.ZodUnion<[z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodPipe<z.ZodLiteral<"">, z.ZodTransform<undefined, "">>]>, z.ZodPipe<z.ZodNull, z.ZodTransform<undefined, null>>]>;
        categoryId: z.ZodUnion<[z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodPipe<z.ZodLiteral<"">, z.ZodTransform<undefined, "">>]>, z.ZodPipe<z.ZodNull, z.ZodTransform<undefined, null>>]>;
        categoryName: z.ZodUnion<[z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodPipe<z.ZodLiteral<"">, z.ZodTransform<undefined, "">>]>, z.ZodPipe<z.ZodNull, z.ZodTransform<undefined, null>>]>;
        color: z.ZodString;
        size: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        unit_price: z.ZodNumber;
        selling_price: z.ZodNumber;
        quantity: z.ZodNumber;
        images: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
        low_stock_alert: z.ZodDefault<z.ZodOptional<z.ZodCoercedNumber<unknown>>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const updatePurchaseSchema: z.ZodObject<{
    paid_amount: z.ZodNumber;
    note: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const purchaseParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const purchaseQuerySchema: z.ZodObject<{
    page: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    limit: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    vendor_id: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        partial: "partial";
        pending: "pending";
        paid: "paid";
    }>>;
    from_date: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<Date | undefined, string | undefined>>;
    search: z.ZodOptional<z.ZodString>;
    to_date: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<Date | undefined, string | undefined>>;
    sort_order: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>>;
    sort_by: z.ZodDefault<z.ZodEnum<{
        createdAt: "createdAt";
        total_amount: "total_amount";
        due_amount: "due_amount";
        purchase_date: "purchase_date";
    }>>;
}, z.core.$strip>;
export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type PurchaseItemInput = z.infer<typeof purchaseItemSchema>;
export type UpdatePurchaseInput = z.infer<typeof updatePurchaseSchema>;
export type ListPurchaseQuery = z.infer<typeof purchaseQuerySchema>;
export {};
//# sourceMappingURL=purchase.validation.d.ts.map