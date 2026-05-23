import express from "express";
import * as OrderController from "./order.controller";
import { validate } from "../../middlewares/validate";
import { createOrderBody, getOrderListQuery } from "./order.validation";
import { companyIdentifier } from "../../middlewares/companyIdentifier";

const router = express.Router();
router.post(
  "/",
  companyIdentifier,
  validate({ body: createOrderBody }),
  OrderController.createOrder,
);
router.get(
  "/",
  companyIdentifier,
  validate({ query: getOrderListQuery }),
  OrderController.getAllOrder,
);
export const OrderRouter = router;
