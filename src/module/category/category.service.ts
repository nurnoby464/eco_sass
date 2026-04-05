// src/module/category/category.service.ts
import mongoose from "mongoose";
import slugify from "slugify";
import Category from "./category.schema";
import { AppError } from "../../middlewares/appError";
import { Request } from "express";
import { auditLog } from "../../utils/auditLogger";
import { AUDIT_ACTIONS } from "../audit/audit.interface";

// ─── helpers ─────────────────────────────────────────────
const generateSlug = (name: string): string => {
  const slug = slugify(name, { lower: true, strict: true });
  // fallback for non-latin scripts (Bengali etc.)
  return slug || `category-${Date.now()}`;
};

const assertUniqSlug = async (
  slug: string,
  company_id: mongoose.Types.ObjectId,
  excludeId?: string,
) => {
  const filter: Record<string, unknown> = { company_id, slug };
  if (excludeId) filter._id = { $ne: excludeId };
  const exists = await Category.findOne(filter).lean();
  if (exists) throw new AppError(`Category "${slug}" already exists`, 409);
};

// ─── Create ───────────────────────────────────────────────
export const createCategory = async (payload: {
  company_id: mongoose.Types.ObjectId;
  name: string;
  parent_id?: string | null;
  image?: string | null;
  createdBy: mongoose.Types.ObjectId;
  req: Request;
}) => {
  const { company_id, name, parent_id, image, createdBy } = payload;

  const slug = generateSlug(name);
  await assertUniqSlug(slug, company_id);

  // resolve path + depth from parent
  let path = "";
  let depth = 0;

  if (parent_id) {
    const parent = await Category.findOne({
      _id: parent_id,
      company_id,
    }).lean();
    if (!parent) throw new AppError("Parent category not found", 404);
    if (!parent.is_active)
      throw new AppError("Parent category is inactive", 400);

    path = parent.path ? `${parent.path},${parent._id}` : `${parent._id}`;
    depth = parent.depth + 1;
  }

  const category = await Category.create({
    company_id,
    name,
    slug,
    parent_id: parent_id ?? null,
    path,
    depth,
    image: image ?? null,
    createdBy,
  });

  auditLog({
    req: payload.req,
    action: AUDIT_ACTIONS.CATEGORY_CREATED,
    targetModel: "Category",
    targetId: category._id,
    after: {
      name: category.name,
      path: category.path,
      depth: category.depth,
      image: category.image,
    },
  });

  return category;
};

// ─── Get all (paginated) ──────────────────────────────────
export const getCategories = async (payload: {
  company_id: mongoose.Types.ObjectId;
  page: number;
  limit: number;
  search?: string;
  parent_id?: string | null;
  depth?: number;
  is_active?: boolean;
}) => {
  const { company_id, page, limit, search, parent_id, depth, is_active } =
    payload;

  const filter: Record<string, unknown> = { company_id };

  if (is_active !== undefined) filter.is_active = is_active;
  if (depth !== undefined) filter.depth = depth;

  // explicit parent_id filter
  // null  → fetch only root categories
  // id    → fetch direct children of that parent
  if (parent_id !== undefined) filter.parent_id = parent_id ?? null;

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const [categories, total] = await Promise.all([
    Category.find(filter)
      .populate("parent_id", "name slug depth")
      .sort({ depth: 1, name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Category.countDocuments(filter),
  ]);

  return { categories, total };
};

// ─── Get tree (all descendants of a root) ────────────────
export const getCategoryTree = async (payload: {
  company_id: mongoose.Types.ObjectId;
  id: string;
}) => {
  const { company_id, id } = payload;

  const root = await Category.findOne({ _id: id, company_id }).lean();
  if (!root) throw new AppError("Category not found", 404);

  // fetch all descendants using path
  const descendants = await Category.find({
    company_id,
    path: { $regex: id },
  })
    .sort({ depth: 1, name: 1 })
    .lean();

  return { root, descendants };
};

// ─── Get one ──────────────────────────────────────────────
export const getCategoryById = async (payload: {
  id: string;
  company_id: mongoose.Types.ObjectId;
}) => {
  const category = await Category.findOne({
    _id: payload.id,
    company_id: payload.company_id,
  })
    .populate("parent_id", "name slug depth")
    .lean();

  if (!category) throw new AppError("Category not found", 404);
  return category;
};

// ─── Update ───────────────────────────────────────────────
export const updateCategory = async (payload: {
  id: string;
  company_id: mongoose.Types.ObjectId;
  req: Request;
  data: {
    name?: string;
    image?: string | null;
    is_active?: boolean;
  };
}) => {
  const { id, company_id, data } = payload;

  const category = await Category.findOne({ _id: id, company_id });
  if (!category) throw new AppError("Category not found", 404);
  const before: Record<string, unknown> = {
    name: category.name,
  };

  // if name changes — regenerate slug and check uniqueness
  if (data.name && data.name !== category.name) {
    const newSlug = generateSlug(data.name);
    await assertUniqSlug(newSlug, company_id, id);
    category.slug = newSlug;
    category.name = data.name;
  }

  if (data.image !== undefined) category.image = data.image;
  if (data.is_active !== undefined) category.is_active = data.is_active;

  await category.save();
  auditLog({
    req: payload.req,
    action: AUDIT_ACTIONS.CATEGORY_UPDATED,
    targetModel: "Category",
    targetId: category._id,
    before: before,
    after: {
      name: category.name,
    },
  });
  return category;
};

// ─── Delete ───────────────────────────────────────────────
export const deleteCategory = async (payload: {
  id: string;
  company_id: mongoose.Types.ObjectId;
  req: Request;
}) => {
  const { id, company_id } = payload;

  const category = await Category.findOne({ _id: id, company_id });
  if (!category) throw new AppError("Category not found", 404);
  const before = {
    name: category.name,
  };

  // block delete if it has children
  const hasChildren = await Category.exists({ company_id, parent_id: id });
  if (hasChildren) {
    throw new AppError(
      "Cannot delete a category that has subcategories. Delete children first.",
      400,
    );
  }

  category.is_active = false;
  await category.save();
  auditLog({
    req: payload.req,
    action: AUDIT_ACTIONS.CATEGORY_DELETED,
    targetModel: "Category",
    targetId: category._id,
    before: before,
    after: null,
  });
  return category;
};
