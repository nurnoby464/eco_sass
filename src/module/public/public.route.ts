import express from "express";

import * as PublicController from "./public.controller";
import { companyIdentifier } from "../../middlewares/companyIdentifier";
import { validate } from "../../middlewares/validate";
import { productQuerySchema } from "../product/product.validation";
const router = express.Router();
// ── /api/public/products ─────────────────────────────────────────
router.get("/products", validate({query: productQuerySchema}), companyIdentifier, PublicController.getProduct);
router.get("/category",companyIdentifier, PublicController.getAllCategories);
router.get("/products/:id", companyIdentifier, PublicController.getProductById);
router.get("/db-test", PublicController.dbTest);

const PublicRoute = router;
export default PublicRoute;