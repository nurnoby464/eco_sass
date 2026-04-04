// src/module/product/product.route.ts
import { Router } from "express";
import { validate } from "../../middlewares/validate";
import * as ProductController from "./product.controller";
import {
  createProductSchema,
  updateProductSchema,
  createVariantSchema,
  updateVariantSchema,
  productParamsSchema,
  variantParamsSchema,
  productQuerySchema,
} from "./product.validation";
import {
  authenticate,
  verifySession,
} from "../../middlewares/AuthenticateHelper";
import { guard } from "../../middlewares/guard";

const router = Router();

// ── /api/products ─────────────────────────────────────────
router
  .route("/")
  .get(
    validate({ query: productQuerySchema }),
    authenticate,
    verifySession,
    guard("super_admin", "admin", "inventory"),
    ProductController.getProducts,
  )
  .post(
    validate({ body: createProductSchema }),
    authenticate,
    verifySession,
    guard("super_admin", "admin", "inventory"),
    ProductController.createProduct,
  );

// ── /api/products/:id ─────────────────────────────────────
router
  .route("/:id")
  .get(
    validate({ params: productParamsSchema }),
    authenticate,
    verifySession,
    guard("super_admin", "admin", "inventory"),
    ProductController.getProductById,
  )
  .patch(
    validate({ params: productParamsSchema, body: updateProductSchema }),
    authenticate,
    verifySession,
    guard("super_admin", "admin", "inventory"),
    ProductController.updateProduct,
  )
  .delete(
    validate({ params: productParamsSchema }),
    authenticate,
    verifySession,
    guard("super_admin", "admin", "inventory"),
    ProductController.deleteProduct,
  );

// ── /api/products/:id/variants ────────────────────────────
router
  .route("/:id/variants")
  .get(
    validate({ params: productParamsSchema }),
    authenticate,
    verifySession,
    guard("super_admin", "admin", "inventory"),
    ProductController.getVariants,
  )
  .post(
    validate({ params: productParamsSchema, body: createVariantSchema }),
    authenticate,
    verifySession,
    guard("super_admin", "admin", "inventory"),
    ProductController.createVariant,
  );

// ── /api/products/:id/variants/:variantId ─────────────────
router
  .route("/:id/variants/:variantId")
  .patch(
    validate({ params: variantParamsSchema, body: updateVariantSchema }),
    authenticate,
    verifySession,
    guard("super_admin", "admin", "inventory"),
    ProductController.updateVariant,
  )
  .delete(
    validate({ params: variantParamsSchema }),
    authenticate,
    verifySession,
    guard("super_admin", "admin", "inventory"),
    ProductController.deleteVariant,
  );

export const ProductRoutes = router;
