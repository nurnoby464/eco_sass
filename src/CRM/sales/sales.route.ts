import express from "express";
import * as SaleController from "./sales.controller";
import { validate } from "../../middlewares/validate";
import { createSaleSchema } from "./sales.validation";
import { companyIdentifier } from "../../middlewares/companyIdentifier";
import { saleAnAuthenticateAndUnauthenticated } from "../../middlewares/saleAuthenticateAndUnauthenticate";

const router = express.Router();

router.post("/create",validate({body:createSaleSchema}),companyIdentifier,saleAnAuthenticateAndUnauthenticated, SaleController.createSale);

export const SaleRouter = router
