import mongoose from "mongoose";
import { Request } from "express";
import Product from "../product/product.schema";
import ProductVariant from "../product-variant/product-variant.schema";
import { IAttribute } from "./product-variant.interface";
import { AppError } from "../../middlewares/appError";
import { auditLog } from "../../utils/auditLogger";
import { AUDIT_ACTIONS } from "../audit/audit.interface";
import { sanitizeData } from "../../utils/sanitizeData";
import { CreateVariantInput, UpdateVariantInput } from "./product-variant.validation";

export const createVariant = async (
  payload: CreateVariantInput & {
    product_id: string;
    company_id: mongoose.Types.ObjectId;
  },
  req: Request,
) => {
  const { product_id, company_id, ...rest } = payload;

  // product must exist, belong to company, and have has_variants = true
  const product = await Product.findOne({
    _id: product_id,
    company_id,
    is_active: true,
  }).lean();
  if (!product) throw new AppError("Product not found", 404);
  if (!product.has_variants) {
    throw new AppError(
      "This product does not support variants. Enable has_variants first.",
      400,
    );
  }

  // unique sku
  //   await assertUniqVariantSku(sku, company_id);

  // Block duplicate attribute combination for this product
  const duplicate = await ProductVariant.findOne({
    product_id,
    is_active: true,
    $and: rest.attributes.map((a: any) => ({
      attributes: { $elemMatch: { key: a.key, value: a.value } },
    })),
  }).lean();
  if (duplicate)
    throw new AppError(
      "A variant with the same attribute combination already exists",
      409,
    );

  const variant = await ProductVariant.create(
    sanitizeData({
      ...rest,
      product_id: new mongoose.Types.ObjectId(product_id),
      company_id,
    }),
  );

  auditLog({
    req,
    action: AUDIT_ACTIONS.VARIANT_CREATED,
    targetModel: "ProductVariant",
    targetId: variant._id,
    after: {
      product_id: variant.product_id,
    },
  });

  return variant;
};

// ─── Get variants of a product ────────────────────────────
export const getVariants = async (payload: {
  product_id: string;
  company_id: mongoose.Types.ObjectId;
}) => {
  const product = await Product.findOne({
    _id: payload.product_id,
    company_id: payload.company_id,
  }).lean();
  if (!product) throw new AppError("Product not found", 404);

  const variants = await ProductVariant.find({
    product_id: payload.product_id,
  })
    .sort({ createdAt: 1 })
    .lean();

  return variants;
};
export const getVariantById = async (
  variantId: string,
  company_id: mongoose.Types.ObjectId,
) => {
  const variant = await ProductVariant.findOne({
    _id: variantId,
    company_id,
  }).lean();
  if (!variant) throw new AppError("Variant not found", 404);
  return variant;
};

// ─── Update variant ───────────────────────────────────────
export const updateVariant = async (
  variantId: string,
  company_id: mongoose.Types.ObjectId,
  payload: UpdateVariantInput,
  req: Request,
) => {
  const variant = await ProductVariant.findOne({
    _id: variantId,
    company_id,
  });
  if (!variant) throw new AppError("Variant not found", 404);

  const before = {
    product_id: variant.product_id,
  };

  const updated = await ProductVariant.findOneAndUpdate(
    { _id: variantId, company_id },
    { $set: sanitizeData(payload) },
    { new: true, runValidators: true },
  ).lean();

  if (!updated) throw new AppError("Variant not found", 404);
  auditLog({
    req,
    action: AUDIT_ACTIONS.VARIANT_UPDATED,
    targetModel: "ProductVariant",
    targetId: variant._id,
    before,
    after: {
      product_id: updated.product_id,
    },
  });
  return updated;
};

// ─── Delete variant ───────────────────────────────────────
export const deleteVariant = async (payload: {
  id: string;
  product_id: string;
  company_id: mongoose.Types.ObjectId;
  req: Request;
}) => {
  const { id, product_id, company_id, req } = payload;

  const variant = await ProductVariant.findOne({
    _id: id,
    product_id,
    company_id,
  });
  if (!variant) throw new AppError("Variant not found", 404);

  variant.is_active = false;
  await variant.save();

  auditLog({
    req,
    action: AUDIT_ACTIONS.VARIANT_DELETED,
    targetModel: "ProductVariant",
    targetId: variant._id,
  });
  return variant;
};
