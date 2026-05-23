import express from "express";
import * as CustomerController from "./customer.controller";
import { validate } from "../../middlewares/validate";
import { customerQuerySchema } from "./customer.validation";
import { authenticate, verifySession } from "../../middlewares/AuthenticateHelper";
import { saleAnAuthenticateAndUnauthenticated } from "../../middlewares/saleAuthenticateAndUnauthenticate";

const router = express.Router();
router.get("/",authenticate,saleAnAuthenticateAndUnauthenticated, verifySession, validate({query:customerQuerySchema}), CustomerController.getCustomerList)
export const CustomerRouter = router;
