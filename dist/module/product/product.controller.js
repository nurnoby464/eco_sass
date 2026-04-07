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
exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getProducts = exports.createProduct = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const ApiResponse_1 = require("../../utils/ApiResponse");
const ProductService = __importStar(require("./product.service"));
const mongoose_1 = __importDefault(require("mongoose"));
// ═══════════════════════════════════════════════════════════
// PRODUCT
// ═══════════════════════════════════════════════════════════
exports.createProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const company_id = new mongoose_1.default.Types.ObjectId(req.user.company_id);
    const createdBy = new mongoose_1.default.Types.ObjectId(req.user._id);
    const product = await ProductService.createProduct({ ...req.body, company_id, createdBy }, req);
    return ApiResponse_1.ApiResponse.created(res, product, "Product created successfully");
});
exports.getProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const query = req.validatedQuery;
    const { products, total } = await ProductService.getProducts({
        company_id: req.user.company_id,
        ...query,
    });
    return ApiResponse_1.ApiResponse.paginated(res, "Product", products, total, query.page, query.limit);
});
exports.getProductById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await ProductService.getProductById({
        id: req.params.id,
        company_id: req.user.company_id,
    });
    return ApiResponse_1.ApiResponse.success(res, result);
});
exports.updateProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const product = await ProductService.updateProduct({
        id: req.params.id,
        company_id: req.user.company_id,
        data: req.body,
        req,
    });
    return ApiResponse_1.ApiResponse.success(res, product, "Product updated successfully");
});
exports.deleteProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const product = await ProductService.deleteProduct({
        id: req.params.id,
        company_id: req.user.company_id,
        req,
    });
    return ApiResponse_1.ApiResponse.success(res, null, "Product deactivated successfully");
});
// ═══════════════════════════════════════════════════════════
// VARIANT
// ═══════════════════════════════════════════════════════════
//# sourceMappingURL=product.controller.js.map