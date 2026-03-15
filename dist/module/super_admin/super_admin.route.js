"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminRoute = void 0;
const express_1 = __importDefault(require("express"));
const validate_1 = require("../../middlewares/validate");
const super_admin_validation_1 = require("./super_admin.validation");
const router = express_1.default.Router();
router.post("/company", (0, validate_1.validate)({ body: super_admin_validation_1.createUserSchema }));
exports.SuperAdminRoute = router;
//# sourceMappingURL=super_admin.route.js.map