import express from "express";
import { validate } from "../../middlewares/validate";
import {
  createCompanyWithAdminSchema,
  createUserSchema,
} from "./super_admin.validation";
import { UserController } from "./super_admin.controller";
import {
  authenticate,
  verifySession,
} from "../../middlewares/AuthenticateHelper";
import { guard } from "../../middlewares/guard";
const router = express.Router();
router.use(authenticate);
router.use(verifySession);
router.post(
  "/company", guard("super_admin"),
  validate({ body: createCompanyWithAdminSchema }),
  UserController.createCompany,
);
// ─── POST /users ──────────────────────────────────────────
router.post("/", validate({ body: createUserSchema }), UserController.create);

// ─── GET /users ───────────────────────────────────────────
router.get("/",guard("super_admin","admin"), UserController.list);

// ─── GET /users/:id ───────────────────────────────────────
router.get("/:id",guard("super_admin","admin"), UserController.getById);

// ─── DELETE /users/:id ────────────────────────────────────
router.delete("/:id",guard("super_admin","admin"), UserController.remove);

// ─── PATCH /users/:id/status ──────────────────────────────
router.patch("/:id/status",guard("super_admin","admin"), UserController.toggleStatus);

export const SuperAdminRoute = router;
