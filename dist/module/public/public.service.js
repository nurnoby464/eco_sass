"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCategories = exports.getProductById = exports.dbTest = exports.getProduct = void 0;
const product_schema_1 = __importDefault(require("../product/product.schema"));
const mongoose_1 = require("mongoose");
const product_variant_schema_1 = __importDefault(require("../product-variant/product-variant.schema"));
const category_schema_1 = __importDefault(require("../category/category.schema"));
const getProduct = async (req, query) => {
    const { vendor_id, page, category_id, limit, sort_by, sort_order, has_variants, is_active, search, low_stock, } = query;
    const filter = { company_id: req.company?._id };
    if (vendor_id)
        filter.vendor_id = vendor_id;
    if (category_id)
        filter.category_id = category_id;
    if (has_variants !== undefined)
        filter.has_variants = has_variants;
    if (is_active !== undefined)
        filter.is_active = is_active;
    if (low_stock === "true")
        filter.$expr = { $lte: ["$stock", "$low_stock_alert"] };
    if (search) {
        filter.name = { $regex: search, $options: "i" };
        filter.selling_price = { $regex: search, $options: "i" };
    }
    const sortOptions = {};
    sortOptions[sort_by ?? "createdAt"] = sort_order === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
        product_schema_1.default.find(filter)
            .sort(sortOptions)
            .select("-buying_price -profit -profit_margin -low_stock_alert")
            .skip(skip)
            .limit(limit)
            .lean(),
        product_schema_1.default.countDocuments(filter),
    ]);
    return { products, total, page, limit };
};
exports.getProduct = getProduct;
const dbTest = async (req, query) => {
    const { vendor_id, page, category_id, limit, sort_by, sort_order, has_variants, is_active, search, low_stock, } = query;
    const filter = { company_id: "69db7c91dfc260658b4a384a" };
    if (vendor_id)
        filter.vendor_id = vendor_id;
    if (category_id)
        filter.category_id = category_id;
    if (has_variants !== undefined)
        filter.has_variants = has_variants;
    if (is_active !== undefined)
        filter.is_active = is_active;
    if (low_stock === "true")
        filter.$expr = { $lte: ["$stock", "$low_stock_alert"] };
    if (search) {
        filter.name = { $regex: search, $options: "i" };
        filter.selling_price = { $regex: search, $options: "i" };
    }
    const sortOptions = {};
    sortOptions[sort_by ?? "createdAt"] = sort_order === "asc" ? 1 : -1;
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
        product_schema_1.default.find(filter)
            .sort(sortOptions)
            .select("-buying_price -profit -profit_margin -low_stock_alert")
            .skip(skip)
            .limit(limit)
            .lean(),
        product_schema_1.default.countDocuments(filter),
    ]);
    return { products, total, page, limit };
};
exports.dbTest = dbTest;
const getProductById = async (payload, req) => {
    const product_id = payload.id;
    const company_id = new mongoose_1.Types.ObjectId(req.company?._id);
    let variant = null;
    const products = await product_schema_1.default.findOne({ _id: product_id, company_id })
        .select("-buying_price -profit -profit_margin -low_stock_alert")
        .lean();
    if (products?.has_variants) {
        variant = await product_variant_schema_1.default.find({ product_id, company_id })
            .select("-buying_price -profit -profit_margin -low_stock_alert")
            .lean();
    }
    return { products, variant };
};
exports.getProductById = getProductById;
const getAllCategories = async (req) => {
    const company_id = new mongoose_1.Types.ObjectId(req.company?._id);
    const categories = await category_schema_1.default.find({ company_id })
        .sort({ createdAt: -1 })
        .lean();
    return categories;
};
exports.getAllCategories = getAllCategories;
//# sourceMappingURL=public.service.js.map