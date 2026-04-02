// src/module/purchase/purchase.route.ts
import { Router }             from "express";
import { validate }           from "../../middlewares/validate";
import * as PurchaseController from "./purchase.controller";
import {
  createPurchaseSchema,
  purchaseParamsSchema,
  purchaseQuerySchema,
} from "./purchase.validation";

const router = Router();

// ── /api/purchases ────────────────────────────────────────
router
  .route("/")
  .get(
    validate({ query: purchaseQuerySchema }),
    PurchaseController.getPurchases
  )
  .post(
    validate({ body: createPurchaseSchema }),
    PurchaseController.createPurchase
  );

// ── /api/purchases/:id ────────────────────────────────────
router
  .route("/:id")
  .get(
    validate({ params: purchaseParamsSchema }),
    PurchaseController.getPurchaseById
  );

export default router;