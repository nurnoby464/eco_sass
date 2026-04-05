// src/module/purchase/purchase.route.ts
import { Router } from "express";
import { validate } from "../../middlewares/validate";
import * as PurchaseController from "./purchase.controller";
import {
  createPurchaseSchema,
  purchaseParamsSchema,
  purchaseQuerySchema,
  updatePurchaseSchema,
} from "./purchase.validation";
import { authenticate, verifySession } from "../../middlewares/AuthenticateHelper";
import { guard } from "../../middlewares/guard";

const router = Router();

// ── /api/purchases ────────────────────────────────────────
router
  .route("/")
  .get(
    validate({ query: purchaseQuerySchema }),
    authenticate, verifySession,
    guard("super_admin", "admin", "account"),
    PurchaseController.getPurchases,
  )
  .post(
    validate({ body: createPurchaseSchema }),
    authenticate, verifySession,
    guard("super_admin", "admin", "account"),
    PurchaseController.createPurchase,
  );

// ── /api/purchases/:id ────────────────────────────────────
router
  .route("/:id")
  .get(
    validate({ params: purchaseParamsSchema }),
    authenticate, verifySession,
    guard("super_admin", "admin", "account"),
    PurchaseController.getPurchaseById,
  )
  .patch(
    validate({ params: purchaseParamsSchema, body: updatePurchaseSchema }),
    authenticate, verifySession,
    guard("super_admin", "admin", "account"),
   PurchaseController.updatePayment
  )
  .delete(
    validate({ params: purchaseParamsSchema }),
    authenticate, verifySession,
    guard("super_admin", "admin"),
   PurchaseController.remove
  );

export const PurchaseRoute = router;
