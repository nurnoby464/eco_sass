import express from "express";
import { validate } from "../../middlewares/validate";
import {
  createCompanyWithAdminSchema,
  createUserSchema,
} from "./super_admin.validation";
import { UserController } from "./super_admin.controller";
const router = express.Router();

router.post(
  "/company",
  validate({ body: createCompanyWithAdminSchema }),
  UserController.createCompany,
);
// ─── POST /users ──────────────────────────────────────────
router.post("/", validate({ body: createUserSchema }), UserController.create);

// ─── GET /users ───────────────────────────────────────────
router.get("/", UserController.list);

// ─── GET /users/:id ───────────────────────────────────────
router.get("/:id", UserController.getById);

// ─── DELETE /users/:id ────────────────────────────────────
router.delete("/:id", UserController.remove);

// ─── PATCH /users/:id/status ──────────────────────────────
router.patch("/:id/status", UserController.toggleStatus);

export const SuperAdminRoute = router;
