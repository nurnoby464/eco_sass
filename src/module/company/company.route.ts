import express from "express";
import { validate } from "../../middlewares/validate";
import { createCompanyUserSchema } from "./company.validation";
import { guard } from "../../middlewares/guard";
import {
  authenticate,
  verifySession,
} from "../../middlewares/AuthenticateHelper";
import { CompanyControllers } from "./company.controller";

const router = express.Router();
router.use(authenticate);
router.use(verifySession);
router.post(
  "/user",
  validate({ body: createCompanyUserSchema }),
  guard("admin", "super_admin"),
  CompanyControllers.createCompanyUser,
);
export const CompanyRouter = router;
