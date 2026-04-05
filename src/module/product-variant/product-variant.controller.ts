import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";
import { ApiResponse } from "../../utils/ApiResponse";
import * as ProductVariantServices from "./product-variant.service";
import mongoose from "mongoose";
import {
  CreateVariantInput,
  UpdateVariantInput,
} from "./product-variant.validation";

export const createVariant = asyncHandler(
  async (req: Request, res: Response) => {
    const company_id = new mongoose.Types.ObjectId(req.user.company_id!);
    const variant = await ProductVariantServices.createVariant(
      {
        ...(req.body as CreateVariantInput),
        product_id: req.params.id as string,
        company_id,
      },
      req,
    );

    return ApiResponse.created(res, variant, "Variant created successfully");
  },
);

export const getVariants = asyncHandler(async (req: Request, res: Response) => {
  const variants = await ProductVariantServices.getVariants({
    product_id: req.params.id as string,
    company_id: req.user.company_id!,
  });

  return ApiResponse.success(res, variants);
});
export const getVariantById = asyncHandler(
  async (req: Request, res: Response) => {
    const company_id = new mongoose.Types.ObjectId(req.user.company_id!);
    const variant = await ProductVariantServices.getVariantById(
      req.params.variantId as string,
      company_id,
    );

    ApiResponse.success(res, variant, "Variant fetched successfully");
  },
);

export const updateVariant = asyncHandler(
  async (req: Request, res: Response) => {
    const company_id = new mongoose.Types.ObjectId(req.user.company_id!);
    const variant = await ProductVariantServices.updateVariant(
      req.params.variantId as string,
      company_id,
      req.body as UpdateVariantInput,
      req,
    );
    return ApiResponse.success(res, variant, "Variant updated successfully");
  },
);

export const deleteVariant = asyncHandler(
  async (req: Request, res: Response) => {
    const variant = await ProductVariantServices.deleteVariant({
      id: req.params.variantId as string,
      product_id: req.params.id as string,
      company_id: req.user.company_id!,
      req,
    });
    return ApiResponse.success(res, null, "Variant deactivated successfully");
  },
);
