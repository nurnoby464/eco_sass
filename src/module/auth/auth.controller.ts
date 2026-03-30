import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";
import { AuthServices } from "./auth.service";
import { ApiResponse } from "../../utils/ApiResponse";
import { AppError } from "../../middlewares/appError";
const COOKIE_OPTIONS = {
  httpOnly: true, // JS can't read it
  secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  sameSite: "strict" as const, // CSRF protection
  maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days in ms
};

const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthServices.login(req.body, req);
  res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);
  return ApiResponse.success(res, result, "Login successfully");
});

// ─── Logout ───────────────────────────────────────────────
const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  await AuthServices.logout(refreshToken);

  // clear the cookie
  res.clearCookie("refreshToken", COOKIE_OPTIONS);

  return ApiResponse.success(res, null, "Logged out successfully");
});

// ─── Refresh access token ─────────────────────────────────
const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) throw new AppError("No refresh token provided", 401);

  const result = await AuthServices.refresh(refreshToken);
  return ApiResponse.success(res, result, "Token refreshed");
});

const removeSession = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId, userId } = req.params;
  await AuthServices.removeSession(sessionId as string, userId as string);
  return ApiResponse.success(res, null, "Session removed. You can now log in.");
});

const updatePassword = asyncHandler(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const result = await AuthServices.updatePassword({
    oldPassword,
    newPassword,
    userId: req.user._id.toString(),
    sessionId: req.user.sessionId,
  });
  return ApiResponse.success(res, null, result.message);
});

export const AuthController = {
  login,
  logout,
  refresh,
  removeSession,
  updatePassword,
};
