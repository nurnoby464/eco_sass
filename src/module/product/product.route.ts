// src/module/product/product.route.ts
import { Router }             from "express";
import { validate }           from "../../middlewares/validate";
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

const router = Router();

// ── /api/products ─────────────────────────────────────────
router
  .route("/")
  .get(
    validate({ query: productQuerySchema }),
    ProductController.getProducts
  )
  .post(
    validate({ body: createProductSchema }),
    ProductController.createProduct
  );

// ── /api/products/:id ─────────────────────────────────────
router
  .route("/:id")
  .get(
    validate({ params: productParamsSchema }),
    ProductController.getProductById
  )
  .patch(
    validate({ params: productParamsSchema, body: updateProductSchema }),
    ProductController.updateProduct
  )
  .delete(
    validate({ params: productParamsSchema }),
    ProductController.deleteProduct
  );

// ── /api/products/:id/variants ────────────────────────────
router
  .route("/:id/variants")
  .get(
    validate({ params: productParamsSchema }),
    ProductController.getVariants
  )
  .post(
    validate({ params: productParamsSchema, body: createVariantSchema }),
    ProductController.createVariant
  );

// ── /api/products/:id/variants/:variantId ─────────────────
router
  .route("/:id/variants/:variantId")
  .patch(
    validate({ params: variantParamsSchema, body: updateVariantSchema }),
    ProductController.updateVariant
  )
  .delete(
    validate({ params: variantParamsSchema }),
    ProductController.deleteVariant
  );

export default router;