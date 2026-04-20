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
exports.getAllCategories = exports.getProductById = exports.dbTest = exports.getProduct = void 0;
const PublicService = __importStar(require("./public.service"));
const ApiResponse_1 = require("../../utils/ApiResponse");
const getProduct = async (req, res) => {
    const query = req.validatedQuery;
    const { products, total, page, limit } = await PublicService.getProduct(req, query);
    return ApiResponse_1.ApiResponse.paginated(res, "Products retrieved successfully", products, total, page, limit);
};
exports.getProduct = getProduct;
const dbTest = async (req, res) => {
    const query = req.validatedQuery;
    const { products, total, page, limit } = await PublicService.dbTest(req, query);
    return ApiResponse_1.ApiResponse.paginated(res, "Products retrieved successfully", products, total, page, limit);
};
exports.dbTest = dbTest;
const getProductById = async (req, res) => {
    const id = req.params.id;
    const products = await PublicService.getProductById({ id }, req);
    return ApiResponse_1.ApiResponse.success(res, products, "Single product retrieved successfully");
};
exports.getProductById = getProductById;
const getAllCategories = async (req, res) => {
    const categories = await PublicService.getAllCategories(req);
    return ApiResponse_1.ApiResponse.success(res, categories, "Categories retrieved successfully");
};
exports.getAllCategories = getAllCategories;
//# sourceMappingURL=public.controller.js.map