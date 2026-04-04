import mongoose from "mongoose";
import slugify from "slugify";
import Product from "./product.schema";
import Category from "../category/category.schema";
import Vendor from "../vendor/vendor.schema";
import { AppError } from "../../middlewares/appError";
import ProductVariant from "../product-variant/product-variant.schema";
import { IAttribute } from "../product-variant/product-variant.interface";
import { auditLog } from "../../utils/auditLogger";
import { AUDIT_ACTIONS } from "../audit/audit.interface";
import { Request } from "express";
import { compareSync } from "bcryptjs";

// ─── helpers ─────────────────────────────────────────────
const generateSlug = (name: string): string => {
  const slug = slugify(name, { lower: true, strict: true });
  return slug || `product-${Date.now()}`;
};

const assertUniqProductSku = async (
  sku: string,
  company_id: mongoose.Types.ObjectId,
  excludeId?: string,
) => {
  const filter: Record<string, unknown> = { company_id, sku };
  if (excludeId) filter._id = { $ne: excludeId };
  const exists = await Product.findOne(filter).lean();
  if (exists) throw new AppError(`Product SKU "${sku}" already exists`, 409);
};

const assertUniqVariantSku = async (
  sku: string,
  company_id: mongoose.Types.ObjectId,
  excludeId?: string,
) => {
  const filter: Record<string, unknown> = { company_id, sku };
  if (excludeId) filter._id = { $ne: excludeId };
  const exists = await ProductVariant.findOne(filter).lean();
  if (exists) throw new AppError(`Variant SKU "${sku}" already exists`, 409);
};

// ─── Create product ───────────────────────────────────────
export const createProduct = async (payload: {
  company_id: mongoose.Types.ObjectId;
  category_id: string;
  vendor_id: string;
  name: string;
  description?: string | null;
  images?: string[];
  sku: string;
  buying_price: number;
  selling_price: number;
  stock?: number;
  low_stock_alert?: number;
  has_variants?: boolean;
  createdBy: mongoose.Types.ObjectId;
  req: Request;
}) => {
  const { company_id, category_id, vendor_id, name, sku } = payload;

  // validate category belongs to company
  const category = await Category.findOne({
    _id: category_id,
    company_id,
    is_active: true,
  }).lean();
  if (!category) throw new AppError("Category not found or inactive", 404);

  // validate vendor belongs to company
  const vendor = await Vendor.findOne({
    _id: vendor_id,
    company_id,
    is_active: true,
  }).lean();
  if (!vendor) throw new AppError("Vendor not found or inactive", 404);

  // unique sku check
  await assertUniqProductSku(sku, company_id);

  const slug = generateSlug(name);

  // unique slug check
  const slugExists = await Product.findOne({ company_id, slug }).lean();
  if (slugExists) throw new AppError(`Product "${name}" already exists`, 409);

  const product = await Product.create({
    ...payload,
    slug,
    // if has_variants — stock must be 0 (lives on variants)
    stock: payload.has_variants ? 0 : (payload.stock ?? 0),
  });

  auditLog({
    req: payload.req,
    action: AUDIT_ACTIONS.PRODUCT_CREATED,
    targetModel: "Product",
    targetId: product._id,
    after: {
      name: product.name,
    },
  });

  return product;
};

// ─── Get all products (paginated) ────────────────────────
export const getProducts = async (payload: {
  company_id: mongoose.Types.ObjectId;
  page: number;
  limit: number;
  search?: string;
  category_id?: string;
  vendor_id?: string;
  has_variants?: boolean;
  is_active?: boolean;
  low_stock?: string;
  sort_by: string;
  sort_order: string;
}) => {
  const {
    company_id,
    page,
    limit,
    search,
    category_id,
    vendor_id,
    has_variants,
    is_active,
    low_stock,
    sort_by,
    sort_order,
  } = payload;

  const filter: Record<string, unknown> = { company_id };

  if (is_active !== undefined) filter.is_active = is_active;
  if (has_variants !== undefined) filter.has_variants = has_variants;
  if (category_id) filter.category_id = category_id;
  if (vendor_id) filter.vendor_id = vendor_id;

  // low stock filter — stock <= low_stock_alert
  if (low_stock === "true") {
    filter.$expr = { $lte: ["$stock", "$low_stock_alert"] };
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
    ];
  }

  const sortDir = sort_order === "asc" ? 1 : -1;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category_id", "name slug depth")
      .populate("vendor_id", "name phone")
      .sort({ [sort_by]: sortDir })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { products, total };
};

// ─── Get one product ──────────────────────────────────────
export const getProductById = async (payload: {
  id: string;
  company_id: mongoose.Types.ObjectId;
}) => {
  const product = await Product.findOne({
    _id: payload.id,
    company_id: payload.company_id,
  })
    .populate("category_id", "name slug path depth")
    .populate("vendor_id", "name phone email")
    .populate("createdBy", "name email")
    .lean();

  if (!product) throw new AppError("Product not found", 404);

  // attach variants if has_variants
  let variants: any[] = [];
  if (product.has_variants) {
    variants = await ProductVariant.find({
      product_id: payload.id,
      is_active: true,
    }).lean();
  }

  return { product, variants };
};

// ─── Update product ───────────────────────────────────────
export const updateProduct = async (payload: {
  id: string;
  company_id: mongoose.Types.ObjectId;
  req: Request;
  data: {
    category_id?: string;
    vendor_id?: string;
    name?: string;
    description?: string | null;
    images?: string[];
    buying_price?: number;
    selling_price?: number;
    stock?: number;
    low_stock_alert?: number;
    is_active?: boolean;
  };
}) => {
  const { id, company_id, data } = payload;

  const product = await Product.findOne({ _id: id, company_id });
  if (!product) throw new AppError("Product not found", 404);

  // validate new category if changing
  if (data.category_id) {
    const category = await Category.findOne({
      _id: data.category_id,
      company_id,
      is_active: true,
    }).lean();
    if (!category) throw new AppError("Category not found or inactive", 404);
    product.category_id = new mongoose.Types.ObjectId(data.category_id);
  }

  // validate new vendor if changing
  if (data.vendor_id) {
    const vendor = await Vendor.findOne({
      _id: data.vendor_id,
      company_id,
      is_active: true,
    }).lean();
    if (!vendor) throw new AppError("Vendor not found or inactive", 404);
    product.vendor_id = new mongoose.Types.ObjectId(data.vendor_id);
  }
  const before: Record<string, unknown> = {
    name: product.name,
  };

  // regenerate slug if name changes
  if (data.name && data.name !== product.name) {
    const newSlug = generateSlug(data.name);
    const slugExists = await Product.findOne({
      company_id,
      slug: newSlug,
      _id: { $ne: id },
    }).lean();
    if (slugExists)
      throw new AppError(`Product "${data.name}" already exists`, 409);
    product.slug = newSlug;
    product.name = data.name;
  }

  // block manual stock update if has_variants
  if (data.stock !== undefined && product.has_variants) {
    throw new AppError(
      "Cannot set stock directly on a product with variants",
      400,
    );
  }

  if (data.description !== undefined) product.description = data.description;
  if (data.images !== undefined) product.images = data.images;
  if (data.buying_price !== undefined) product.buying_price = data.buying_price;
  if (data.selling_price !== undefined)
    product.selling_price = data.selling_price;
  if (data.stock !== undefined) product.stock = data.stock;
  if (data.low_stock_alert !== undefined)
    product.low_stock_alert = data.low_stock_alert;
  if (data.is_active !== undefined) product.is_active = data.is_active;

  await product.save(); // pre-save hook recalculates profit + margin
  auditLog({
    req: payload.req,
    action: AUDIT_ACTIONS.PRODUCT_UPDATED,
    targetModel: "Product",
    targetId: product._id,
    before: before,
    after: {
      name: product.name,
    },
  });
  return product;
};

// ─── Delete product ───────────────────────────────────────
export const deleteProduct = async (payload: {
  id: string;
  company_id: mongoose.Types.ObjectId;
  req: Request;
}) => {
  const { id, company_id } = payload;

  const product = await Product.findOne({ _id: id, company_id });
  if (!product) throw new AppError("Product not found", 404);
  const before = {
    name: product.name,
  };
  // soft delete product
  product.is_active = false;
  await product.save();

  // soft delete all variants
  if (product.has_variants) {
    await ProductVariant.updateMany({ product_id: id }, { is_active: false });
  }
  auditLog({
    req: payload.req,
    action: AUDIT_ACTIONS.PRODUCT_DELETED,
    targetModel: "Product",
    targetId: product._id,
    before: before,
    after: null,
  });
  return product;
};

// ═══════════════════════════════════════════════════════════
// VARIANT SERVICES
// ═══════════════════════════════════════════════════════════

// ─── Create variant ───────────────────────────────────────
export const createVariant = async (payload: {
  product_id: string;
  company_id: mongoose.Types.ObjectId;
  attributes: IAttribute[];
  sku: string;
  buying_price: number;
  selling_price: number;
  stock?: number;
  low_stock_alert?: number;
  req: Request;
}) => {
  const { product_id, company_id, sku, req } = payload;
console.log(payload)
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
  await assertUniqVariantSku(sku, company_id);

  // check duplicate attribute combination for this product
  const attrFilter = payload.attributes.map((a) => ({
    $elemMatch: { key: a.key, value: a.value },
  }));

  const duplicate = await ProductVariant.findOne({
    product_id,
    is_active: true,
    $and: payload.attributes.map((a) => ({
      attributes: { $elemMatch: { key: a.key, value: a.value } },
    })),
  }).lean();

  if (duplicate) {
    throw new AppError(
      "A variant with the same attribute combination already exists",
      409,
    );
  }

  const variant = await ProductVariant.create({
    ...payload,
    product_id: new mongoose.Types.ObjectId(product_id),
  });

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

// ─── Update variant ───────────────────────────────────────
export const updateVariant = async (payload: {
  id: string;
  product_id: string;
  company_id: mongoose.Types.ObjectId;
  req:Request;
  data: {
    attributes?: IAttribute[];
    sku?: string;
    buying_price?: number;
    selling_price?: number;
    stock?: number;
    low_stock_alert?: number;
    is_active?: boolean;
  };
}) => {
  const { id, product_id, company_id, data,req } = payload;

  const variant = await ProductVariant.findOne({
    _id: id,
    product_id,
    company_id,
  });
  if (!variant) throw new AppError("Variant not found", 404);

  // sku uniqueness check if changing
  if (data.sku && data.sku !== variant.sku) {
    await assertUniqVariantSku(data.sku, company_id, id);
    variant.sku = data.sku;
  }

  if (data.attributes !== undefined) variant.attributes = data.attributes;
  if (data.buying_price !== undefined) variant.buying_price = data.buying_price;
  if (data.selling_price !== undefined)
    variant.selling_price = data.selling_price;
  if (data.stock !== undefined) variant.stock = data.stock;
  if (data.low_stock_alert !== undefined)
    variant.low_stock_alert = data.low_stock_alert;
  if (data.is_active !== undefined) variant.is_active = data.is_active;

  await variant.save(); // pre-save recalculates profit
    auditLog({
        req,
        action: AUDIT_ACTIONS.VARIANT_UPDATED,
        targetModel: "ProductVariant",
        targetId: variant._id,
        after: {
            product_id: variant.product_id,
        },
      });
  return variant;
};

// ─── Delete variant ───────────────────────────────────────
export const deleteVariant = async (payload: {
  id: string;
  product_id: string;
  company_id: mongoose.Types.ObjectId;
  req: Request;
}) => {
  const { id, product_id, company_id ,req} = payload;

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
