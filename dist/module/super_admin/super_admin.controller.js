"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const super_admin_service_1 = require("./super_admin.service");
const ApiResponse_1 = require("../../utils/ApiResponse");
const appError_1 = require("../../middlewares/appError");
// ─── POST /users ──────────────────────────────────────────
const create = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await super_admin_service_1.UserService.createUser(req.body, req.user?._id ?? null);
    return ApiResponse_1.ApiResponse.created(res, user, 'User created successfully');
});
// ─── GET /users/:id ───────────────────────────────────────
const getById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const user = await super_admin_service_1.UserService.getUserById(id);
    return ApiResponse_1.ApiResponse.success(res, user);
});
// ─── GET /users ───────────────────────────────────────────
const list = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { users, total, page, limit } = await super_admin_service_1.UserService.listUsers(req.query);
    return ApiResponse_1.ApiResponse.paginated(res, users, total, page, limit);
});
// ─── DELETE /users/:id ────────────────────────────────────
const remove = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const requestor = req.user;
    if (requestor.role !== 'super_admin' && requestor.role !== 'admin') {
        throw new appError_1.AppError('You do not have permission to delete users', 403);
    }
    await super_admin_service_1.UserService.deleteUser(id, requestor);
    return ApiResponse_1.ApiResponse.success(res, null, 'User deleted successfully');
});
// ─── PATCH /users/:id/status ──────────────────────────────
const toggleStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = req.params.id;
    const user = await super_admin_service_1.UserService.toggleUserStatus(id, req.user);
    return ApiResponse_1.ApiResponse.success(res, user, 'User status updated');
});
exports.UserController = {
    create,
    getById,
    list,
    remove,
    toggleStatus,
};
//# sourceMappingURL=super_admin.controller.js.map