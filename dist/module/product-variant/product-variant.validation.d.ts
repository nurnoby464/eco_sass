import { z } from "zod";
export declare const createVariantSchema: z.ZodObject<{
    attributes: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodString;
    }, z.core.$strip>>;
    buying_price: z.ZodNumber;
    selling_price: z.ZodNumber;
    stock: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    low_stock_alert: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    image: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const updateVariantSchema: z.ZodObject<{
    buying_price: z.ZodOptional<z.ZodNumber>;
    selling_price: z.ZodOptional<z.ZodNumber>;
    stock: z.ZodOptional<z.ZodNumber>;
    low_stock_alert: z.ZodOptional<z.ZodNumber>;
    image: z.ZodOptional<z.ZodString>;
    is_active: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const variantParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const productVariantParamsSchema: z.ZodObject<{
    id: z.ZodString;
    variantId: z.ZodString;
}, z.core.$strip>;
export declare const productVariantQuerySchema: z.ZodObject<{
    page: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    limit: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    search: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodDefault<z.ZodPipe<z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>, z.ZodTransform<1 | -1, "asc" | "desc" | undefined>>>;
    sortBy: z.ZodDefault<z.ZodEnum<{
        createdAt: "createdAt";
        total_amount: "total_amount";
        due_amount: "due_amount";
        purchase_date: "purchase_date";
    }>>;
    stock: z.ZodOptional<z.ZodEnum<{
        lowStock: "lowStock";
        outOfStock: "outOfStock";
        reminderStock: "reminderStock";
    }>>;
}, z.core.$strip>;
export declare const editProductVariantSchema: z.ZodObject<{
    variantId: z.ZodString;
    sellingPrice: z.ZodNumber;
    newImage: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    previousImage: z.ZodString;
    alertStock: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type EditProductVariantInput = z.infer<typeof editProductVariantSchema>;
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
//# sourceMappingURL=product-variant.validation.d.ts.map