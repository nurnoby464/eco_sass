// src/module/category/category.controller.ts
import { Request, Response } from "express";
import { asyncHandler }      from "../../utils/asyncHandler";
import { ApiResponse }       from "../../utils/ApiResponse";
import * as CategoryService  from "./category.service";

// ─── Create ───────────────────────────────────────────────
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await CategoryService.createCategory({
    ...req.body,
    company_id: req.user.company_id!,
    createdBy : req.user._id,
    req
  });
  return ApiResponse.created(res, category, "Category created successfully");
});

// ─── Get all ──────────────────────────────────────────────
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const query = req.validatedQuery as {
    page      : number;
    limit     : number;
    search   ?: string;
    parent_id?: string | null;
    depth    ?: number;
    is_active?: boolean;
  };

  const { categories, total } = await CategoryService.getCategories({
    company_id: req.user.company_id!,
    ...query,
  });

  return ApiResponse.paginated(res,"Category", categories, total, query.page, query.limit);
});

// ─── Get tree ─────────────────────────────────────────────
export const getCategoryTree = asyncHandler(async (req: Request, res: Response) => {
  const result = await CategoryService.getCategoryTree({
    company_id: req.user.company_id!,
    id        : req.params.id as string,
  });

  return ApiResponse.success(res, result);
});

// ─── Get one ──────────────────────────────────────────────
export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const category = await CategoryService.getCategoryById({
    id        : req.params.id as string,
    company_id: req.user.company_id!,
  });

  return ApiResponse.success(res, category);
});

// ─── Update ───────────────────────────────────────────────
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {

  const category = await CategoryService.updateCategory({
    id        : req.params.id as string,
    company_id: req.user.company_id!,
    data      : req.body,
    req
  });
  return ApiResponse.success(res, category, "Category updated successfully");
});

// ─── Delete ───────────────────────────────────────────────
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await CategoryService.deleteCategory({
    id        : req.params.id as string,
    company_id: req.user.company_id!,
    req
  });
  return ApiResponse.success(res, null, "Category deactivated successfully");
});