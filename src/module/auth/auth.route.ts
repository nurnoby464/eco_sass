import express from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../middlewares/validate";
import { loginSchema } from "./auth.schema";
const router = express.Router();

router.post("/login", validate({ body: loginSchema }), AuthController.login);
router.post("/logout", AuthController.logout);
router.post("/refresh", AuthController.refresh);
router.delete("/session/:userId/:sessionId", AuthController.removeSession);

export const AuthRoutes = router;
