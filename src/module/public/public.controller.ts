import { Request, Response } from "express";
import * as PublicService from "./public.service";
import { GetProductQuery } from "../product/product.validation";
import { ApiResponse } from "../../utils/ApiResponse";
export const getProduct = async (req: Request, res: Response) => {
  const query = req.validatedQuery;
  const {products,total,page,limit} = await PublicService.getProduct(
    req,
    query as GetProductQuery,
  );
  return ApiResponse.paginated(res,"Products retrieved successfully", products,total,page,limit );
};

export const getProductById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const products = await PublicService.getProductById({ id }, req);
  return ApiResponse.success(res, products, "Single product retrieved successfully");
};
export const getAllCategories = async (req: Request, res: Response) => {
  const categories = await PublicService.getAllCategories(req);
   return ApiResponse.success(res, categories, "Categories retrieved successfully");
};
