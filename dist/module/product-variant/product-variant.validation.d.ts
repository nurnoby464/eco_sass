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
export type CreateVariantInput = z.infer<typeof createVariantSchema>;
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;
//# sourceMappingURL=product-variant.validation.d.ts.map