// src/module/category/category.route.ts
import { Router }              from "express";
import { validate }            from "../../middlewares/validate";
import * as CategoryController from "./category.controller";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryParamsSchema,
  categoryQuerySchema,
} from "./category.validation";

const router = Router();

// ── /api/categories ───────────────────────────────────────
router
  .route("/")
  .get(
    validate({ query: categoryQuerySchema }),
    CategoryController.getCategories
  )
  .post(
    validate({ body: createCategorySchema }),
    CategoryController.createCategory
  );

// ── /api/categories/:id/tree ──────────────────────────────
router
  .route("/:id/tree")
  .get(
    validate({ params: categoryParamsSchema }),
    CategoryController.getCategoryTree
  );

// ── /api/categories/:id ───────────────────────────────────
router
  .route("/:id")
  .get(
    validate({ params: categoryParamsSchema }),
    CategoryController.getCategoryById
  )
  .patch(
    validate({ params: categoryParamsSchema, body: updateCategorySchema }),
    CategoryController.updateCategory
  )
  .delete(
    validate({ params: categoryParamsSchema }),
    CategoryController.deleteCategory
  );

export default router;