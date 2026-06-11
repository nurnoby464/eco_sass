import mongoose from "mongoose";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import * as SaleServices from "./sales.service";
import { Request, Response } from "express";
import { create } from "node:domain";

export const createSale = asyncHandler(async (req: Request, res: Response) => {
  const companyId = new mongoose.Types.ObjectId(req.user.company_id!);
  const createdBy = new mongoose.Types.ObjectId(req.user._id);
  const createdByType =
    req.user.role !== "customer" && req.user.role !== "super_admin"
      ? "staff"
      : "system";

  const result = await SaleServices.createSale({
    input: req.body,
    companyId,
    createdBy,
    createdByType,
  });
  return ApiResponse.created(res, result, "sales created successfully");
});
