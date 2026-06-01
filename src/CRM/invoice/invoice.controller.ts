import mongoose, { Types } from "mongoose";
import { ApiResponse } from "../../utils/ApiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import * as InvoiceServices from "./invoice.service";
import { Request, Response } from "express";

export const getByOrderId = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params as { orderId: string };
  const result = await InvoiceServices.getByOrderId(new Types.ObjectId(orderId));
  return ApiResponse.success(res, result);
});
