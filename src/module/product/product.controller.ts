// src/module/product/product.controller.ts
import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import * as ProductService from "./product.service";

// ═══════════════════════════════════════════════════════════
// PRODUCT
// ═══════════════════════════════════════════════════════════

export const createProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await ProductService.createProduct({
      ...req.body,
      company_id: req.user.company_id!,
      createdBy: req.user._id,
      req,
    });

    return ApiResponse.created(res, product, "Product created successfully");
  },
);

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const query = req.validatedQuery as {
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
  };

  const { products, total } = await ProductService.getProducts({
    company_id: req.user.company_id!,
    ...query,
  });

  return ApiResponse.paginated(
    res,
    "Product",
    products,
    total,
    query.page,
    query.limit,
  );
});

export const getProductById = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await ProductService.getProductById({
      id: req.params.id as string,
      company_id: req.user.company_id!,
    });

    return ApiResponse.success(res, result);
  },
);

export const updateProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await ProductService.updateProduct({
      id: req.params.id as string,
      company_id: req.user.company_id!,
      data: req.body,
      req,
    });

    return ApiResponse.success(res, product, "Product updated successfully");
  },
);

export const deleteProduct = asyncHandler(
  async (req: Request, res: Response) => {
    const product = await ProductService.deleteProduct({
      id: req.params.id as string,
      company_id: req.user.company_id!,
      req
    });

    return ApiResponse.success(res, null, "Product deactivated successfully");
  },
);

// ═══════════════════════════════════════════════════════════
// VARIANT
// ═══════════════════════════════════════════════════════════

export const createVariant = asyncHandler(
  async (req: Request, res: Response) => {
    const variant = await ProductService.createVariant({
      ...req.body,
      product_id: req.params.id,
      company_id: req.user.company_id!,
    });

 

    return ApiResponse.created(res, variant, "Variant created successfully");
  },
);

export const getVariants = asyncHandler(async (req: Request, res: Response) => {
  const variants = await ProductService.getVariants({
    product_id: req.params.id as string,
    company_id: req.user.company_id!,
  });

  return ApiResponse.success(res, variants);
});

export const updateVariant = asyncHandler(
  async (req: Request, res: Response) => {
    const variant = await ProductService.updateVariant({
      id: req.params.variantId as string,
      product_id: req.params.id    as string,
      company_id: req.user.company_id!,
      data: req.body,
      req
    });
    return ApiResponse.success(res, variant, "Variant updated successfully");
  },
);

export const deleteVariant = asyncHandler(
  async (req: Request, res: Response) => {
    const variant = await ProductService.deleteVariant({
      id: req.params.variantId as string,
      product_id: req.params.id   as string,
      company_id: req.user.company_id!,
      req
    });
    return ApiResponse.success(res, null, "Variant deactivated successfully");
  },
);
