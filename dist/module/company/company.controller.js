"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyControllers = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const company_service_1 = require("./company.service");
const ApiResponse_1 = require("../../utils/ApiResponse");
const createCompanyUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await company_service_1.CompanyServices.createCompanyUser(req.body, req);
    return ApiResponse_1.ApiResponse.created(res, user, "Company user created successfully");
});
const getAllUsers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { user, page, limit, total } = await company_service_1.CompanyServices.getAllUsers(req.validatedQuery, req);
    return ApiResponse_1.ApiResponse.paginated(res, "User fetch successfully", user, total, page, limit);
    // return ApiResponse.success(res, result, "Users fetched successfully");
});
const getUserById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await company_service_1.CompanyServices.getUserById(req.params.id, req);
    return ApiResponse_1.ApiResponse.success(res, result, "User fetched successfully");
});
const updateUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await company_service_1.CompanyServices.updateUser(req.params.id, req.body, req);
    return ApiResponse_1.ApiResponse.success(res, result, "User updated successfully");
});
const deleteUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    await company_service_1.CompanyServices.deleteUser(req.params.id, req);
    return ApiResponse_1.ApiResponse.success(res, null, "User deleted successfully");
});
exports.CompanyControllers = {
    createCompanyUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
};
//# sourceMappingURL=company.controller.js.map