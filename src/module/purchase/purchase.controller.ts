// src/module/purchase/purchase.controller.ts
import { Request, Response } from "express";
import { asyncHandler }      from "../../utils/asyncHandler";
import { ApiResponse }       from "../../utils/ApiResponse";
import { AUDIT_ACTIONS }     from "../audit/audit.interface";
import * as PurchaseService  from "./purchase.service";
import { auditLog } from "../../utils/auditLogger";

// ─── Create ───────────────────────────────────────────────
export const createPurchase = asyncHandler(async (req: Request, res: Response) => {
  const purchase = await PurchaseService.createPurchase({
    ...req.body,
    company_id: req.user.company_id!,
    createdBy : req.user._id,
  });
  if(!purchase) {
    return ApiResponse.error(res, "Failed to create purchase");
  }

  auditLog({
    req,
    action     : AUDIT_ACTIONS.PURCHASE_CREATED,
    targetModel: "Purchase",
    targetId   : purchase._id,
    after      : {
      vendor_id   : purchase.vendor_id,
      total_amount: purchase.total_amount,
      paid_amount : purchase.paid_amount,
      due_amount  : purchase.due_amount,
      status      : purchase.status,
      items_count : purchase.items.length,
    },
  });

  return ApiResponse.created(res, purchase, "Purchase created successfully");
});

// ─── Get all ──────────────────────────────────────────────
export const getPurchases = asyncHandler(async (req: Request, res: Response) => {
  const query = req.validatedQuery as {
    page      : number;
    limit     : number;
    vendor_id?: string;
    status   ?: "pending" | "partial" | "paid";
    from_date?: Date;
    to_date  ?: Date;
    sort_order: string;
  };

  const { purchases, total } = await PurchaseService.getPurchases({
    company_id: req.user.company_id!,
    ...query,
  });

  return ApiResponse.paginated(res,"Purchase get successfully!", purchases, total, query.page, query.limit);
});

// ─── Get one ──────────────────────────────────────────────
export const getPurchaseById = asyncHandler(async (req: Request, res: Response) => {
  const purchase = await PurchaseService.getPurchaseById({
    id        : req.params.id as string,
    company_id: req.user.company_id!,
  });

  return ApiResponse.success(res, purchase);
});