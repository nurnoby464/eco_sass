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
const AuthenticateHelper_1 = require("../../middlewares/AuthenticateHelper");
const guard_1 = require("../../middlewares/guard");
const company_validation_1 = require("../company/company.validation");
const router = express_1.default.Router();
router.use(AuthenticateHelper_1.authenticate);
router.use(AuthenticateHelper_1.verifySession);
router.post("/company", (0, guard_1.guard)("super_admin"), (0, validate_1.validate)({ body: company_validation_1.createNewCompanySchema }), super_admin_controller_1.UserController.createCompany);
// ─── POST /users ──────────────────────────────────────────
router.post("/", (0, validate_1.validate)({ body: super_admin_validation_1.createUserSchema }), super_admin_controller_1.UserController.create);
// ─── GET /users ───────────────────────────────────────────
router.get("/company/", (0, guard_1.guard)("super_admin"), // only super_admin sees all companies
(0, validate_1.validate)({ query: company_validation_1.companyQuerySchema }), super_admin_controller_1.UserController.getAllCompanies);
router.get("/company/:id", (0, guard_1.guard)("super_admin", "admin"), // super_admin sees any, admin sees own
(0, validate_1.validate)({ params: company_validation_1.companyParamsSchema }), super_admin_controller_1.UserController.getCompanyById);
router.get("/", (0, guard_1.guard)("super_admin", "admin"), super_admin_controller_1.UserController.list);
// ─── GET /users/:id ───────────────────────────────────────
router.get("/:id", (0, guard_1.guard)("super_admin", "admin"), super_admin_controller_1.UserController.getById);
// ─── DELETE /users/:id ────────────────────────────────────
router.patch("/company/:id/status", (0, guard_1.guard)("super_admin", "admin"), super_admin_controller_1.UserController.toggleStatus);
router.patch("/company/:id", (0, guard_1.guard)("super_admin", "admin"), // admin can update own company only
(0, validate_1.validate)({ params: company_validation_1.companyParamsSchema, body: company_validation_1.updateCompanySchema }), super_admin_controller_1.UserController.updateCompany);
router.delete("/:id", (0, guard_1.guard)("super_admin", "admin"), super_admin_controller_1.UserController.remove);
router.delete("/company/:id", (0, guard_1.guard)("super_admin"), // only super_admin can delete
(0, validate_1.validate)({ params: company_validation_1.companyParamsSchema }), super_admin_controller_1.UserController.deleteCompany);
exports.SuperAdminRoute = router;
//# sourceMappingURL=super_admin.route.js.map