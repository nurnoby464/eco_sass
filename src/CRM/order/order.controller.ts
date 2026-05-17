import mongoose from "mongoose";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import * as OrderServices from "./order.service";
import { Request, Response } from "express";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.company?._id;
  if (!companyId) {
    return ApiResponse.error(res, "Created Order place failed", 400);
  }
  const result = await OrderServices.createOrder({
    companyId,
    input: req.body,
  });
  return ApiResponse.created(res, result, "sales created successfully");
});
