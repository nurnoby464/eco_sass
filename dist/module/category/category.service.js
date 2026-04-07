"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategoryById = exports.getCategoryTree = exports.getCategories = exports.createCategory = void 0;
const slugify_1 = __importDefault(require("slugify"));
const category_schema_1 = __importDefault(require("./category.schema"));
const appError_1 = require("../../middlewares/appError");
const auditLogger_1 = require("../../utils/auditLogger");
const audit_interface_1 = require("../audit/audit.interface");
// ─── helpers ─────────────────────────────────────────────
const generateSlug = (name) => {
    const slug = (0, slugify_1.default)(name, { lower: true, strict: true });
    // fallback for non-latin scripts (Bengali etc.)
    return slug || `category-${Date.now()}`;
};
const assertUniqSlug = async (slug, company_id, excludeId) => {
    const filter = { company_id, slug };
    if (excludeId)
        filter._id = { $ne: excludeId };
    const exists = await category_schema_1.default.findOne(filter).lean();
    if (exists)
        throw new appError_1.AppError(`Category "${slug}" already exists`, 409);
};
// ─── Create ───────────────────────────────────────────────
const createCategory = async (payload) => {
    const { company_id, name, parent_id, image, createdBy } = payload;
    const slug = generateSlug(name);
    await assertUniqSlug(slug, company_id);
    // resolve path + depth from parent
    let path = "";
    let depth = 0;
    if (parent_id) {
        const parent = await category_schema_1.default.findOne({
            _id: parent_id,
            company_id,
        }).lean();
        if (!parent)
            throw new appError_1.AppError("Parent category not found", 404);
        if (!parent.is_active)
            throw new appError_1.AppError("Parent category is inactive", 400);
        path = parent.path ? `${parent.path},${parent._id}` : `${parent._id}`;
        depth = parent.depth + 1;
    }
    const category = await category_schema_1.default.create({
        company_id,
        name,
        slug,
        parent_id: parent_id ?? null,
        path,
        depth,
        image: image ?? null,
        createdBy,
    });
    (0, auditLogger_1.auditLog)({
        req: payload.req,
        action: audit_interface_1.AUDIT_ACTIONS.CATEGORY_CREATED,
        targetModel: "Category",
        targetId: category._id,
        after: {
            name: category.name,
            path: category.path,
            depth: category.depth,
            image: category.image,
        },
    });
    return category;
};
exports.createCategory = createCategory;
// ─── Get all (paginated) ──────────────────────────────────
const getCategories = async (payload) => {
    const { company_id, page, limit, search, parent_id, depth, is_active } = payload;
    const filter = { company_id };
    if (is_active !== undefined)
        filter.is_active = is_active;
    if (depth !== undefined)
        filter.depth = depth;
    // explicit parent_id filter
    // null  → fetch only root categories
    // id    → fetch direct children of that parent
    if (parent_id !== undefined)
        filter.parent_id = parent_id ?? null;
    if (search) {
        filter.name = { $regex: search, $options: "i" };
    }
    const [categories, total] = await Promise.all([
        category_schema_1.default.find(filter)
            .populate("parent_id", "name slug depth")
            .sort({ depth: 1, name: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        category_schema_1.default.countDocuments(filter),
    ]);
    return { categories, total };
};
exports.getCategories = getCategories;
// ─── Get tree (all descendants of a root) ────────────────
const getCategoryTree = async (payload) => {
    const { company_id, id } = payload;
    const root = await category_schema_1.default.findOne({ _id: id, company_id }).lean();
    if (!root)
        throw new appError_1.AppError("Category not found", 404);
    // fetch all descendants using path
    const descendants = await category_schema_1.default.find({
        company_id,
        path: { $regex: id },
    })
        .sort({ depth: 1, name: 1 })
        .lean();
    return { root, descendants };
};
exports.getCategoryTree = getCategoryTree;
// ─── Get one ──────────────────────────────────────────────
const getCategoryById = async (payload) => {
    const category = await category_schema_1.default.findOne({
        _id: payload.id,
        company_id: payload.company_id,
    })
        .populate("parent_id", "name slug depth")
        .lean();
    if (!category)
        throw new appError_1.AppError("Category not found", 404);
    return category;
};
exports.getCategoryById = getCategoryById;
// ─── Update ───────────────────────────────────────────────
const updateCategory = async (payload) => {
    const { id, company_id, data } = payload;
    const category = await category_schema_1.default.findOne({ _id: id, company_id });
    if (!category)
        throw new appError_1.AppError("Category not found", 404);
    const before = {
        name: category.name,
    };
    // if name changes — regenerate slug and check uniqueness
    if (data.name && data.name !== category.name) {
        const newSlug = generateSlug(data.name);
        await assertUniqSlug(newSlug, company_id, id);
        category.slug = newSlug;
        category.name = data.name;
    }
    if (data.image !== undefined)
        category.image = data.image;
    if (data.is_active !== undefined)
        category.is_active = data.is_active;
    await category.save();
    (0, auditLogger_1.auditLog)({
        req: payload.req,
        action: audit_interface_1.AUDIT_ACTIONS.CATEGORY_UPDATED,
        targetModel: "Category",
        targetId: category._id,
        before: before,
        after: {
            name: category.name,
        },
    });
    return category;
};
exports.updateCategory = updateCategory;
// ─── Delete ───────────────────────────────────────────────
const deleteCategory = async (payload) => {
    const { id, company_id } = payload;
    const category = await category_schema_1.default.findOne({ _id: id, company_id });
    if (!category)
        throw new appError_1.AppError("Category not found", 404);
    const before = {
        name: category.name,
    };
    // block delete if it has children
    const hasChildren = await category_schema_1.default.exists({ company_id, parent_id: id });
    if (hasChildren) {
        throw new appError_1.AppError("Cannot delete a category that has subcategories. Delete children first.", 400);
    }
    category.is_active = false;
    await category.save();
    (0, auditLogger_1.auditLog)({
        req: payload.req,
        action: audit_interface_1.AUDIT_ACTIONS.CATEGORY_DELETED,
        targetModel: "Category",
        targetId: category._id,
        before: before,
        after: null,
    });
    return category;
};
exports.deleteCategory = deleteCategory;
//# sourceMappingURL=category.service.js.map