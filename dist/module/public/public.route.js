"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PublicController = __importStar(require("./public.controller"));
const companyIdentifier_1 = require("../../middlewares/companyIdentifier");
const validate_1 = require("../../middlewares/validate");
const product_validation_1 = require("../product/product.validation");
const router = express_1.default.Router();
// ── /api/public/products ─────────────────────────────────────────
router.get("/products", (0, validate_1.validate)({ query: product_validation_1.productQuerySchema }), companyIdentifier_1.companyIdentifier, PublicController.getProduct);
router.get("/category", companyIdentifier_1.companyIdentifier, PublicController.getAllCategories);
router.get("/products/:id", companyIdentifier_1.companyIdentifier, PublicController.getProductById);
const PublicRoute = router;
exports.default = PublicRoute;
//# sourceMappingURL=public.route.js.map