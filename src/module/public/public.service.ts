import { categoryParamsSchema } from "./../category/category.validation";
import { Request } from "express";
import { GetProductQuery } from "../product/product.validation";
import Product from "../product/product.schema";
import { GetProductParamsQuery } from "./public.validation";
import { Types } from "mongoose";
import ProductVariant from "../product-variant/product-variant.schema";
import Category from "../category/category.schema";
import { create } from "node:domain";
export const getProduct = async (req: Request, query: GetProductQuery) => {
  const {
    vendor_id,
    page,
    category_id,
    limit,
    sort_by,
    sort_order,
    has_variants,
    is_active,
    search,
    low_stock,
  } = query;
  const filter: any = { company_id: req.company?._id };

  if (vendor_id) filter.vendor_id = vendor_id;
  if (category_id) filter.category_id = category_id;
  if (has_variants !== undefined) filter.has_variants = has_variants;
  if (is_active !== undefined) filter.is_active = is_active;
  if (low_stock === "true")
    filter.$expr = { $lte: ["$stock", "$low_stock_alert"] };
  if (search) {
    filter.name = { $regex: search, $options: "i" };
    filter.selling_price = { $regex: search, $options: "i" };
  }

  const sortOptions: any = {};
  sortOptions[sort_by ?? "createdAt"] = sort_order === "asc" ? 1 : -1;
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortOptions)
      .select("-buying_price -profit -profit_margin -low_stock_alert")
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);
  return { products, total,page,limit };
};
export const dbTest = async (req: Request, query: GetProductQuery) => {
  const {
    vendor_id,
    page,
    category_id,
    limit,
    sort_by,
    sort_order,
    has_variants,
    is_active,
    search,
    low_stock,
  } = query;
  const filter: any = { company_id: "69db7c91dfc260658b4a384a"};

  if (vendor_id) filter.vendor_id = vendor_id;
  if (category_id) filter.category_id = category_id;
  if (has_variants !== undefined) filter.has_variants = has_variants;
  if (is_active !== undefined) filter.is_active = is_active;
  if (low_stock === "true")
    filter.$expr = { $lte: ["$stock", "$low_stock_alert"] };
  if (search) {
    filter.name = { $regex: search, $options: "i" };
    filter.selling_price = { $regex: search, $options: "i" };
  }

  const sortOptions: any = {};
  sortOptions[sort_by ?? "createdAt"] = sort_order === "asc" ? 1 : -1;
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sortOptions)
      .select("-buying_price -profit -profit_margin -low_stock_alert")
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);
  return { products, total,page,limit };
};

export const getProductById = async (
  payload: GetProductParamsQuery,
  req: Request,
) => {
  const product_id = payload.id;
  const company_id = new Types.ObjectId(req.company?._id);
  let variant = null;
  const products = await Product.findOne({ _id: product_id, company_id })
    .select("-buying_price -profit -profit_margin -low_stock_alert")
    .lean();
  if (products?.has_variants) {
    variant = await ProductVariant.find({ product_id, company_id })
      .select("-buying_price -profit -profit_margin -low_stock_alert")
      .lean();
  }
  return { products, variant };
};

export const getAllCategories = async (req: Request) => {
  const company_id = new Types.ObjectId(req.company?._id);
  const categories = await Category.find({ company_id })
    .sort({ createdAt: -1 })
    .lean();
  return categories;
};
