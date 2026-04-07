"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const asyncHandler_1 = require("../../utils/asyncHandler");
const auth_service_1 = require("./auth.service");
const ApiResponse_1 = require("../../utils/ApiResponse");
const appError_1 = require("../../middlewares/appError");
const COOKIE_OPTIONS = {
    httpOnly: true, // JS can't read it
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
    sameSite: "strict", // CSRF protection
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days in ms
};
const login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await auth_service_1.AuthServices.login(req.body, req);
    res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);
    return ApiResponse_1.ApiResponse.success(res, result, "Login successfully");
});
// ─── Logout ───────────────────────────────────────────────
const logout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    await auth_service_1.AuthServices.logout(refreshToken);
    // clear the cookie
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    return ApiResponse_1.ApiResponse.success(res, null, "Logged out successfully");
});
// ─── Refresh access token ─────────────────────────────────
const refresh = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken)
        throw new appError_1.AppError("No refresh token provided", 401);
    const result = await auth_service_1.AuthServices.refresh(refreshToken);
    return ApiResponse_1.ApiResponse.success(res, result, "Token refreshed");
});
const removeSession = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { sessionId, userId } = req.params;
    await auth_service_1.AuthServices.removeSession(sessionId, userId);
    return ApiResponse_1.ApiResponse.success(res, null, "Session removed. You can now log in.");
});
const updatePassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const result = await auth_service_1.AuthServices.updatePassword({
        oldPassword,
        newPassword,
        userId: req.user._id.toString(),
        sessionId: req.user.sessionId,
    });
    return ApiResponse_1.ApiResponse.success(res, null, result.message);
});
exports.AuthController = {
    login,
    logout,
    refresh,
    removeSession,
    updatePassword,
};
//# sourceMappingURL=auth.controller.js.map