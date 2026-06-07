import express from "express";
import * as OrderController from "./order.controller";
import { validate } from "../../middlewares/validate";
import {
  createOrderBody,
  getMyOrdersQuerySchema,
  getOrderListQuery,
} from "./order.validation";
import { companyIdentifier } from "../../middlewares/companyIdentifier";
import {
  authenticate,
  verifySession,
} from "../../middlewares/AuthenticateHelper";
import { guard } from "../../middlewares/guard";

const router = express.Router();
router.post(
  "/",
  companyIdentifier,
  validate({ body: createOrderBody }),
  OrderController.createOrder,
);
// router.get(
//   "/me",
//   authenticate,
//   validate({ query: getOrderListQuery }),
//   OrderController.getAllOrder,
// );


router.get(
  "/my-orders",
  authenticate,
  verifySession,
  guard("customer"),
  validate({ query: getMyOrdersQuerySchema }),
  OrderController.getMyOrders,
);
router.get(
  "/",
  companyIdentifier,
  validate({ query: getOrderListQuery }),
  OrderController.getAllOrder,
);
export const OrderRouter = router;
