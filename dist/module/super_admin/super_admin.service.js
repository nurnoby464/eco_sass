"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const appError_1 = require("../../middlewares/appError");
const super_admin_schema_1 = __importDefault(require("./super_admin.schema"));
// ─── Helpers ──────────────────────────────────────────────
function assertValidObjectId(id, label = 'ID') {
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new appError_1.AppError(`Invalid ${label}: "${id}"`, 400);
    }
}
// ─── Service ──────────────────────────────────────────────
// ─── createUser ───────────────────────────────────────────
const createUser = async (input, createdBy) => {
    const existing = await super_admin_schema_1.default.findOne({ email: input.email }).lean();
    if (existing) {
        throw new appError_1.AppError('Email already in use', 409);
    }
    const user = await super_admin_schema_1.default.create({
        name: input.name,
        email: input.email,
        password: input.password,
        role: input.role,
        company_id: input.company_id
            ? new mongoose_1.default.Types.ObjectId(input.company_id)
            : null,
        createdBy,
    });
    return user.toJSON();
};
// ─── getUserById ──────────────────────────────────────────
const getUserById = async (id) => {
    assertValidObjectId(id, 'user ID');
    const user = await super_admin_schema_1.default.findById(id).lean();
    if (!user)
        throw new appError_1.AppError('User not found', 404);
    return user;
};
// ─── listUsers ────────────────────────────────────────────
// Accepts raw req.query — parsing and sanitisation happens here, not in the controller.
const listUsers = async (rawQuery) => {
    const page = Math.max(1, parseInt(rawQuery.page ?? '1', 10));
    const limit = Math.min(100, parseInt(rawQuery.limit ?? '10', 10));
    const skip = (page - 1) * limit;
    const filter = {};
    if (rawQuery.company_id) {
        assertValidObjectId(rawQuery.company_id, 'company_id');
        filter.company_id = new mongoose_1.default.Types.ObjectId(rawQuery.company_id);
    }
    if (rawQuery.role)
        filter.role = rawQuery.role;
    if (rawQuery.is_active)
        filter.is_active = rawQuery.is_active === 'true';
    const [users, total] = await Promise.all([
        super_admin_schema_1.default.find(filter).skip(skip).limit(limit).lean(),
        super_admin_schema_1.default.countDocuments(filter),
    ]);
    return { users, total, page, limit };
};
// ─── deleteUser ───────────────────────────────────────────
// super_admin  → can delete anyone
// admin        → can only delete users inside their own company
const deleteUser = async (id, requestor) => {
    assertValidObjectId(id, 'user ID');
    const target = await super_admin_schema_1.default.findById(id);
    if (!target)
        throw new appError_1.AppError('User not found', 404);
    // Prevent self-deletion
    if (target._id.equals(requestor._id)) {
        throw new appError_1.AppError('You cannot delete your own account', 400);
    }
    // Prevent deleting another super_admin
    if (target.role === 'super_admin') {
        throw new appError_1.AppError('super_admin accounts cannot be deleted', 403);
    }
    // Admin scope check — admin can only delete users in their company
    if (requestor.role === 'admin' &&
        !target.company_id?.equals(requestor.company_id)) {
        throw new appError_1.AppError('You can only delete users within your company', 403);
    }
    await target.deleteOne();
};
// ─── toggleUserStatus ─────────────────────────────────────
// Flips is_active. Same scope rules as deleteUser.
const toggleUserStatus = async (id, requestor) => {
    assertValidObjectId(id, 'user ID');
    const target = await super_admin_schema_1.default.findById(id);
    if (!target)
        throw new appError_1.AppError('User not found', 404);
    if (target._id.equals(requestor._id)) {
        throw new appError_1.AppError('You cannot change your own status', 400);
    }
    if (target.role === 'super_admin') {
        throw new appError_1.AppError('super_admin status cannot be changed', 403);
    }
    if (requestor.role === 'admin' &&
        !target.company_id?.equals(requestor.company_id)) {
        throw new appError_1.AppError('You can only manage users within your company', 403);
    }
    target.is_active = !target.is_active;
    await target.save();
    return target.toJSON();
};
// ─── Export ───────────────────────────────────────────────
exports.UserService = {
    createUser,
    getUserById,
    listUsers,
    deleteUser,
    toggleUserStatus,
};
//# sourceMappingURL=super_admin.service.js.map