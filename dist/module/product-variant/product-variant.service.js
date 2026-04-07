"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVariant = exports.updateVariant = exports.getVariantById = exports.getVariants = exports.createVariant = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const product_schema_1 = __importDefault(require("../product/product.schema"));
const product_variant_schema_1 = __importDefault(require("../product-variant/product-variant.schema"));
const appError_1 = require("../../middlewares/appError");
const auditLogger_1 = require("../../utils/auditLogger");
const audit_interface_1 = require("../audit/audit.interface");
const sanitizeData_1 = require("../../utils/sanitizeData");
const createVariant = async (payload, req) => {
    const { product_id, company_id, ...rest } = payload;
    // product must exist, belong to company, and have has_variants = true
    const product = await product_schema_1.default.findOne({
        _id: product_id,
        company_id,
        is_active: true,
    }).lean();
    if (!product)
        throw new appError_1.AppError("Product not found", 404);
    if (!product.has_variants) {
        throw new appError_1.AppError("This product does not support variants. Enable has_variants first.", 400);
    }
    // unique sku
    //   await assertUniqVariantSku(sku, company_id);
    // Block duplicate attribute combination for this product
    const duplicate = await product_variant_schema_1.default.findOne({
        product_id,
        is_active: true,
        $and: rest.attributes.map((a) => ({
            attributes: { $elemMatch: { key: a.key, value: a.value } },
        })),
    }).lean();
    if (duplicate)
        throw new appError_1.AppError("A variant with the same attribute combination already exists", 409);
    const variant = await product_variant_schema_1.default.create((0, sanitizeData_1.sanitizeData)({
        ...rest,
        product_id: new mongoose_1.default.Types.ObjectId(product_id),
        company_id,
    }));
    (0, auditLogger_1.auditLog)({
        req,
        action: audit_interface_1.AUDIT_ACTIONS.VARIANT_CREATED,
        targetModel: "ProductVariant",
        targetId: variant._id,
        after: {
            product_id: variant.product_id,
        },
    });
    return variant;
};
exports.createVariant = createVariant;
// ─── Get variants of a product ────────────────────────────
const getVariants = async (payload) => {
    const product = await product_schema_1.default.findOne({
        _id: payload.product_id,
        company_id: payload.company_id,
    }).lean();
    if (!product)
        throw new appError_1.AppError("Product not found", 404);
    const variants = await product_variant_schema_1.default.find({
        product_id: payload.product_id,
    })
        .sort({ createdAt: 1 })
        .lean();
    return variants;
};
exports.getVariants = getVariants;
const getVariantById = async (variantId, company_id) => {
    const variant = await product_variant_schema_1.default.findOne({
        _id: variantId,
        company_id,
    }).lean();
    if (!variant)
        throw new appError_1.AppError("Variant not found", 404);
    return variant;
};
exports.getVariantById = getVariantById;
// ─── Update variant ───────────────────────────────────────
const updateVariant = async (variantId, company_id, payload, req) => {
    const variant = await product_variant_schema_1.default.findOne({
        _id: variantId,
        company_id,
    });
    if (!variant)
        throw new appError_1.AppError("Variant not found", 404);
    const before = {
        product_id: variant.product_id,
    };
    const updated = await product_variant_schema_1.default.findOneAndUpdate({ _id: variantId, company_id }, { $set: (0, sanitizeData_1.sanitizeData)(payload) }, { new: true, runValidators: true }).lean();
    if (!updated)
        throw new appError_1.AppError("Variant not found", 404);
    (0, auditLogger_1.auditLog)({
        req,
        action: audit_interface_1.AUDIT_ACTIONS.VARIANT_UPDATED,
        targetModel: "ProductVariant",
        targetId: variant._id,
        before,
        after: {
            product_id: updated.product_id,
        },
    });
    return updated;
};
exports.updateVariant = updateVariant;
// ─── Delete variant ───────────────────────────────────────
const deleteVariant = async (payload) => {
    const { id, product_id, company_id, req } = payload;
    const variant = await product_variant_schema_1.default.findOne({
        _id: id,
        product_id,
        company_id,
    });
    if (!variant)
        throw new appError_1.AppError("Variant not found", 404);
    variant.is_active = false;
    await variant.save();
    (0, auditLogger_1.auditLog)({
        req,
        action: audit_interface_1.AUDIT_ACTIONS.VARIANT_DELETED,
        targetModel: "ProductVariant",
        targetId: variant._id,
    });
    return variant;
};
exports.deleteVariant = deleteVariant;
//# sourceMappingURL=product-variant.service.js.map