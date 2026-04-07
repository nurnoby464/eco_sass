"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productVariantParamsSchema = exports.variantParamsSchema = exports.updateVariantSchema = exports.createVariantSchema = void 0;
const zod_1 = require("zod");
const mongoId = zod_1.z.string().trim().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");
const attributeSchema = zod_1.z.object({
    key: zod_1.z.string().trim().min(1),
    value: zod_1.z.string().trim().min(1),
});
exports.createVariantSchema = zod_1.z.object({
    attributes: zod_1.z.array(attributeSchema).min(1, "At least one attribute required"),
    //   sku            : z.string().trim().toUpperCase().optional(),   // auto-generated if omitted
    buying_price: zod_1.z.number({ error: "Buying price is required" }).min(0),
    selling_price: zod_1.z.number({ error: "Selling price is required" }).min(0),
    stock: zod_1.z.number().int().min(0).optional().default(0),
    low_stock_alert: zod_1.z.number().int().min(0).optional().default(5),
    image: zod_1.z.string().trim().url("Must be a valid image URL").nullable(),
});
exports.updateVariantSchema = zod_1.z
    .object({
    buying_price: zod_1.z.number().min(0).optional(),
    selling_price: zod_1.z.number().min(0).optional(),
    stock: zod_1.z.number().int().min(0).optional(),
    low_stock_alert: zod_1.z.number().int().min(0).optional(),
    image: zod_1.z.string().trim().url().optional(),
    is_active: zod_1.z.boolean().optional(),
})
    .refine((d) => Object.keys(d).length > 0, { message: "At least one field is required" });
exports.variantParamsSchema = zod_1.z.object({ id: mongoId });
exports.productVariantParamsSchema = zod_1.z.object({
    id: mongoId, // product id
    variantId: mongoId,
});
//# sourceMappingURL=product-variant.validation.js.map