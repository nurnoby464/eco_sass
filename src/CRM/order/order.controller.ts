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
  return ApiResponse.created(res, result, "Order created successfully");
});

export const getAllOrder = asyncHandler(async (req: Request, res: Response) => {
  const companyId = req.company?._id;
  const limit = req.validatedQuery.limit as number;
  const page = req.validatedQuery.page as number;
  const sortBy = req.validatedQuery.sortBy as "name" | "createdAt" | "stock";
  const search = req.validatedQuery.search as string;
  const sortOrder = req.validatedQuery.sortOrder as 1 | -1;
  const orderStatus = req.validatedQuery.orderStatus as
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | undefined;
  const paymentStatus = req.validatedQuery.paymentStatus as
    | "partial"
    | "unpaid"
    | "paid"
    | undefined;
  const customerId = req.validatedQuery.customerId as string;

  if (!companyId) {
    return ApiResponse.error(res, "Created Order place failed", 400);
  }
  const query = {
    limit,
    page,
    sortBy,
    sortOrder,
    search,
    orderStatus,
    paymentStatus,
    customerId,
  };
  const { orders, total,orderStatusCounts } = await OrderServices.getAllOrder(companyId, query);
  return ApiResponse.paginated(
    res,
    "Order fetched successfully",
    orders,
    total,
    page,
    limit,
    orderStatusCounts
  );
});
