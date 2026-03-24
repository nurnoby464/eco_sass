"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminRoute = void 0;
const express_1 = __importDefault(require("express"));
const validate_1 = require("../../middlewares/validate");
const super_admin_validation_1 = require("./super_admin.validation");
const super_admin_controller_1 = require("./super_admin.controller");
const router = express_1.default.Router();
router.post("/company", (0, validate_1.validate)({ body: super_admin_validation_1.createUserSchema }));
// ─── POST /users ──────────────────────────────────────────
router.post("/", (0, validate_1.validate)({ body: super_admin_validation_1.createUserSchema }), super_admin_controller_1.UserController.create);
// ─── GET /users ───────────────────────────────────────────
router.get("/", super_admin_controller_1.UserController.list);
// ─── GET /users/:id ───────────────────────────────────────
router.get("/:id", super_admin_controller_1.UserController.getById);
// ─── DELETE /users/:id ────────────────────────────────────
router.delete("/:id", super_admin_controller_1.UserController.remove);
// ─── PATCH /users/:id/status ──────────────────────────────
router.patch("/:id/status", super_admin_controller_1.UserController.toggleStatus);
exports.SuperAdminRoute = router;
//# sourceMappingURL=super_admin.route.js.map