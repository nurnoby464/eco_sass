import mongoose from "mongoose";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import * as CustomerServices from "./customer.service";
import { Request, Response } from "express";

export const createSale = asyncHandler(async (req: Request, res: Response) => {
  const result = await CustomerServices.createSale();
  return ApiResponse.created(res, result, "sales created successfully");
});
