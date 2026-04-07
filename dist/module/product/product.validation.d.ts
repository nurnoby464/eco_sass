import { z } from "zod";
export declare const createProductSchema: z.ZodObject<{
    category_id: z.ZodString;
    vendor_id: z.ZodString;
    name: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    images: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
    sku: z.ZodString;
    buying_price: z.ZodNumber;
    selling_price: z.ZodNumber;
    stock: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    low_stock_alert: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    has_variants: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export declare const updateProductSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    images: z.ZodOptional<z.ZodArray<z.ZodString>>;
    buying_price: z.ZodOptional<z.ZodNumber>;
    selling_price: z.ZodOptional<z.ZodNumber>;
    stock: z.ZodOptional<z.ZodNumber>;
    low_stock_alert: z.ZodOptional<z.ZodNumber>;
    is_active: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const productParamsSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
export declare const productQuerySchema: z.ZodObject<{
    page: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    limit: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<number, string | undefined>>;
    search: z.ZodOptional<z.ZodString>;
    category_id: z.ZodOptional<z.ZodString>;
    vendor_id: z.ZodOptional<z.ZodString>;
    has_variants: z.ZodPipe<z.ZodOptional<z.ZodEnum<{
        true: "true";
        false: "false";
    }>>, z.ZodTransform<boolean | undefined, "true" | "false" | undefined>>;
    is_active: z.ZodPipe<z.ZodOptional<z.ZodEnum<{
        true: "true";
        false: "false";
    }>>, z.ZodTransform<boolean | undefined, "true" | "false" | undefined>>;
    low_stock: z.ZodOptional<z.ZodEnum<{
        true: "true";
    }>>;
    sort_by: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        name: "name";
        createdAt: "createdAt";
        selling_price: "selling_price";
        stock: "stock";
    }>>>;
    sort_order: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        asc: "asc";
        desc: "desc";
    }>>>;
}, z.core.$strip>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductQuery = z.infer<typeof createProductSchema>;
export type GetProductQuery = z.infer<typeof productQuerySchema>;
//# sourceMappingURL=product.validation.d.ts.map