import { z } from "zod";
declare const purchaseItemSchema: z.ZodObject<{
    product_name: z.ZodString;
    category: z.ZodString;
    color: z.ZodString;
    size: z.ZodString;
    unit_price: z.ZodNumber;
    selling_price: z.ZodNumber;
    quantity: z.ZodNumber;
    low_stock_alert: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export declare const createPurchaseSchema: z.ZodObject<{
    vendor_id: z.ZodString;
    purchase_date: z.ZodOptional<z.ZodString>;
    paid_amount: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    note: z.ZodOptional<z.ZodString>;
    items: z.ZodArray<z.ZodObject<{
        product_name: z.ZodString;
        category: z.ZodString;
        color: z.ZodString;
        size: z.ZodString;
        unit_price: z.ZodNumber;
        selling_price: z.ZodNumber;
        quantity: z.ZodNumber;
        low_stock_alert: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
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