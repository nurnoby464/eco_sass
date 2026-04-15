import express from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../middlewares/validate";
import {
  loginSchema,
  sessionParamsSchema,
  updatePasswordSchema,
} from "./auth.schema";
import {
  authenticate,
  verifySession,
} from "../../middlewares/AuthenticateHelper";
import { registerCustomerSchema } from "../super_admin/super_admin.validation";
import { companyIdentifier } from "../../middlewares/companyIdentifier";
const router = express.Router();
// public
router.post("/login", validate({ body: loginSchema }), AuthController.login);
router.post("/refresh", AuthController.refresh);
router.post(
  "/register",
  validate({ body: registerCustomerSchema }),
  companyIdentifier,
  AuthController.registerCustomer,
);
router.delete(
  "/session/:userId/:sessionId",
  validate({ params: sessionParamsSchema }),
  AuthController.removeSession,
);

// protected
router.use(authenticate);
router.post("/logout", AuthController.logout);
router.use(verifySession);
router.patch(
  "/update-password",
  validate({ body: updatePasswordSchema }),
  AuthController.updatePassword,
);

export const AuthRoutes = router;
