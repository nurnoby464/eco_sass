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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getCategoryTree = exports.getCategories = exports.createCategory = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const ApiResponse_1 = require("../../utils/ApiResponse");
const CategoryService = __importStar(require("./category.service"));
// ─── Create ───────────────────────────────────────────────
exports.createCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const category = await CategoryService.createCategory({
        ...req.body,
        company_id: req.user.company_id,
        createdBy: req.user._id,
        req
    });
    return ApiResponse_1.ApiResponse.created(res, category, "Category created successfully");
});
// ─── Get all ──────────────────────────────────────────────
exports.getCategories = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const query = req.validatedQuery;
    const { categories, total } = await CategoryService.getCategories({
        company_id: req.user.company_id,
        ...query,
    });
    return ApiResponse_1.ApiResponse.paginated(res, "Category", categories, total, query.page, query.limit);
});
// ─── Get tree ─────────────────────────────────────────────
exports.getCategoryTree = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await CategoryService.getCategoryTree({
        company_id: req.user.company_id,
        id: req.params.id,
    });
    return ApiResponse_1.ApiResponse.success(res, result);
});
// ─── Get one ──────────────────────────────────────────────
exports.getCategoryById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const category = await CategoryService.getCategoryById({
        id: req.params.id,
        company_id: req.user.company_id,
    });
    return ApiResponse_1.ApiResponse.success(res, category);
});
// ─── Update ───────────────────────────────────────────────
exports.updateCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const category = await CategoryService.updateCategory({
        id: req.params.id,
        company_id: req.user.company_id,
        data: req.body,
        req
    });
    return ApiResponse_1.ApiResponse.success(res, category, "Category updated successfully");
});
// ─── Delete ───────────────────────────────────────────────
exports.deleteCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const category = await CategoryService.deleteCategory({
        id: req.params.id,
        company_id: req.user.company_id,
        req
    });
    return ApiResponse_1.ApiResponse.success(res, null, "Category deactivated successfully");
});
//# sourceMappingURL=category.controller.js.map