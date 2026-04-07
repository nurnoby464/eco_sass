"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyServices = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const appError_1 = require("../../middlewares/appError");
const super_admin_schema_1 = __importDefault(require("../super_admin/super_admin.schema"));
const company_schema_1 = __importDefault(require("./company.schema"));
const auditLogger_1 = require("../../utils/auditLogger");
const audit_interface_1 = require("../audit/audit.interface");
const auth_schema_1 = __importDefault(require("../auth/auth.schema"));
const ADMIN_ROLES = [
    "account",
    "site_management",
    "inventory",
    "sales",
    "report",
];
const SUPER_ADMIN_ROLES = ["admin", ...ADMIN_ROLES];
const targetFinder = async (userId, req, action) => {
    const filter = {
        _id: new mongoose_1.default.Types.ObjectId(userId),
    };
    if (req.user.role === "admin") {
        filter.company_id = req.user.company_id;
    }
    const target = await super_admin_schema_1.default.findOne(filter).lean();
    if (!target) {
        throw new appError_1.AppError("Target user not found", 404);
    }
    if (target._id.equals(req.user._id)) {
        throw new appError_1.AppError(`You cannot ${action} your own account`, 400);
    }
    if (target.role === "super_admin") {
        throw new appError_1.AppError(`super_admin accounts cannot be ${action}`, 403);
    }
    if (target.role === "admin" && req.user.role === "admin") {
        throw new appError_1.AppError(`Admin cannot ${action} another admin`, 403);
    }
    return target;
};
const createCompanyUser = async (payload, req) => {
    const { companyId, name, email, role, password } = payload;
    const isSuperAdmin = req.user.role === "super_admin";
    if (isSuperAdmin) {
        if (!companyId) {
            throw new appError_1.AppError("Company Id is required for Super Admin", 400);
        }
        if (!SUPER_ADMIN_ROLES.includes(role)) {
            throw new appError_1.AppError(`Invalid role: ${role}`, 403);
        }
    }
    else {
        if (!ADMIN_ROLES.includes(role)) {
            throw new appError_1.AppError(`Admin cannot assign role: ${role}`, 403);
        }
    }
    let companyIdToUse;
    if (isSuperAdmin) {
        const [existing, company] = await Promise.all([
            super_admin_schema_1.default.findOne({ email }).select("_id").lean(),
            company_schema_1.default.findById(companyId).select("_id status").lean(),
        ]);
        if (existing)
            throw new appError_1.AppError("Email already registered", 409);
        if (!company) {
            throw new appError_1.AppError("Company not found", 404);
        }
        if (company.status !== "active") {
            throw new appError_1.AppError("Cannot create user for an inactive company", 400);
        }
        companyIdToUse = company._id;
    }
    else {
        if (!req.user.company_id)
            throw new appError_1.AppError("Company not found", 404);
        const existing = await super_admin_schema_1.default.findOne({ email }).select("_id").lean();
        if (existing)
            throw new appError_1.AppError("Email already registered", 409);
        companyIdToUse = new mongoose_1.default.Types.ObjectId(req.user.company_id.toString());
    }
    const user = await super_admin_schema_1.default.create({
        name,
        email,
        password,
        role,
        createdBy: req.user._id,
        company_id: companyIdToUse,
    });
    (0, auditLogger_1.auditLog)({
        req,
        action: audit_interface_1.AUDIT_ACTIONS.USER_CREATED,
        targetModel: "User",
        targetId: user._id,
        after: {
            name: user.name,
            email: user.email,
            role: user.role,
            company_id: user.company_id,
            is_active: user.is_active,
        },
    });
    return user.toJSON();
};
const getAllUsers = async (query, req) => {
    const { page, limit, search, role, is_active, sortBy, sortOrder, company_id, } = query;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.user.role === "admin") {
        filter.company_id = req.user.company_id;
        filter.role = {
            $in: ["account", "site_management", "inventory", "sales", "report"],
        };
    }
    else {
        if (company_id)
            filter.company_id = new mongoose_1.default.Types.ObjectId(company_id);
    }
    if (role)
        filter.role = role;
    if (is_active)
        filter.is_active = is_active;
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }
    const [total, user] = await Promise.all([
        super_admin_schema_1.default.countDocuments(filter),
        super_admin_schema_1.default.find(filter)
            .select("-password -reset_token -reset_token_exp")
            .populate("company_id", "company_name company_email status")
            .populate("createdBy", "name email")
            .skip(skip)
            .limit(limit)
            .sort({ [sortBy ?? "createdAt"]: sortOrder ?? -1 })
            .lean(),
    ]);
    return {
        user,
        page,
        limit,
        total,
    };
};
const getUserById = async (userId, req) => {
    const filter = {
        _id: new mongoose_1.default.Types.ObjectId(userId),
    };
    // admin can only see users in their own company
    if (req.user.role === "admin") {
        filter.company_id = req.user.company_id;
    }
    const user = await super_admin_schema_1.default.findOne(filter)
        .select("-password -reset_token -reset_token_exp")
        .populate("company_id", "company_name company_email status")
        .populate("createdBy", "name email")
        .lean();
    if (!user)
        throw new appError_1.AppError("Single user not found", 404);
    return user;
};
const updateUser = async (userId, payload, req) => {
    const target = await targetFinder(userId, req, "update");
    // if (payload.role && req.user.role === "admin") {
    //   throw new AppError("Admin cannot change user roles", 403);
    // }
    const before = {
        name: target.name,
        role: target.role,
        is_active: target.is_active,
    };
    const updateData = {};
    if (payload.name !== undefined)
        updateData.name = payload.name;
    if (payload.role !== undefined)
        updateData.role = payload.role;
    if (payload.is_active !== undefined)
        updateData.is_active = payload.is_active;
    if (Object.keys(updateData).length === 0) {
        throw new appError_1.AppError("No fields to update", 400);
    }
    const updated = await super_admin_schema_1.default.findByIdAndUpdate(userId, {
        $set: updateData,
    }, { new: true, runValidators: true }).select("-password -reset_token -reset_token_exp");
    if (!updated)
        throw new appError_1.AppError("User update failed", 500);
    if (payload.is_active === false) {
        await auth_schema_1.default.deleteMany({ userId: target._id });
    }
    (0, auditLogger_1.auditLog)({
        req,
        action: "USER_UPDATED",
        targetModel: "User",
        targetId: updated._id,
        before,
        after: {
            name: updated.name,
            role: updated.role,
            is_active: updated.is_active,
        },
    });
    return updated.toJSON();
};
const deleteUser = async (userId, req) => {
    const target = await targetFinder(userId, req, "delete");
    // snapshot for audit
    const snapshot = {
        name: target.name,
        email: target.email,
        role: target.role,
        company_id: target.company_id,
        is_active: target.is_active,
    };
    // ── delete user + their sessions in parallel ──────────
    await Promise.all([
        super_admin_schema_1.default.findByIdAndDelete(userId),
        auth_schema_1.default.deleteMany({ userId: target._id }),
    ]);
    // ── audit ──────────────────────────────────────────────
    (0, auditLogger_1.auditLog)({
        req,
        action: audit_interface_1.AUDIT_ACTIONS.USER_DELETED,
        targetModel: "User",
        targetId: target._id,
        before: snapshot,
        after: null,
    });
};
exports.CompanyServices = {
    createCompanyUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
};
//# sourceMappingURL=company.service.js.map