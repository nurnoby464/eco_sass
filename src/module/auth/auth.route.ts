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
const router = express.Router();
// public
router.post("/login", validate({ body: loginSchema }), AuthController.login);
router.post("/refresh", AuthController.refresh);
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
