import {
  ISessionPublic,
  SessionLimitError,
} from "./../../middlewares/appError";
import { ObjectId, Types } from "mongoose";
import { jwtConfig } from "./../../config/jwt.config";
import { Request } from "express";
import { AppError } from "../../middlewares/appError";
import { ITokenPayload, JwtHelper } from "../../utils/jwtHelper";
import User from "../super_admin/super_admin.schema";
import { Secret } from "jsonwebtoken";
import Session from "./auth.schema";
import { enforceSessionLimit } from "../../utils/sessionHelper";

interface ILogin {
  email: string;
  password: string;
}
const login = async (payload: ILogin, req: Request) => {
  const MAX_SESSIONS = 5;
  const { email, password } = payload;
  const existing = await User.findOne({ email, is_active: true }).select(
    "+password",
  );
  if (!existing) {
    throw new AppError("This email user not found", 400);
  }
  const isMatch = await existing.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Password incorrect!");
  }
  //check session limit
  const activeSessions = await Session.find({
    userId: existing._id,
    valid: true,
  })
    .sort({ updatedAt: -1 }) // newest first for display
    .select("_id user_agent userId ip createdAt updatedAt")
    .lean();
  if (activeSessions.length >= MAX_SESSIONS) {
    const sessionList: ISessionPublic[] = activeSessions?.map((session) => ({
      sessionId: session._id.toString(),
      user_agent: session.user_agent,
      userId: session.userId.toString(),
      ip: session.ip,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));
    throw new SessionLimitError(sessionList);
  }
  // await enforceSessionLimit(existing._id);

  // Layer 1 — reuse or create session
  const session = await Session.findOneAndUpdate(
    {
      userId: existing._id,
      valid: true,
      user_agent: req.headers["user-agent"] ?? null,
    },
    {
      $set: {
        ip: req.ip ?? null,
      },
      $setOnInsert: {
        userId: existing._id,
        valid: true,
        user_agent: req.headers["user-agent"] ?? null,
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    },
  );
  if (!session) {
    throw new AppError("Session created failed");
  }
  const data: ITokenPayload = {
    _id: existing._id,
    email: existing.email,
    name: existing.name,
    role: existing.role,
    company_id: existing.company_id ?? null,
    sessionId: session._id.toString(),
  };
  const accessToken = await JwtHelper.generateToken({
    data,
    secret: jwtConfig.access.secret as Secret,
    expiresIn: jwtConfig.access.expiresIn,
  });
  const refreshToken = await JwtHelper.generateToken({
    data,
    secret: jwtConfig.refresh.secret,
    expiresIn: jwtConfig.refresh.expiresIn,
  });
  const result = await User.findByIdAndUpdate(
    existing._id,
    { last_login: new Date() },
    { new: true, runValidators: true },
  );
  if (!result) {
    throw new AppError("Last login not updated");
  }
  const user = result.toJSON();
  return {
    user,
    accessToken,
    refreshToken,
  };
};

// ─── Logout ───────────────────────────────────────────────
const logout = async (refreshToken: string) => {
  if (!refreshToken) throw new AppError("Already logged out", 400);
  const decoded = JwtHelper.verifyToken({
    token: refreshToken,
    secret: jwtConfig.refresh.secret,
  });
  if (!decoded) {
    throw new AppError("Token data not found", 400);
  }
  await Session.findByIdAndUpdate(decoded.sessionId, {
    valid: false,
  });
};

// ─── Refresh ──────────────────────────────────────────────
const refresh = async (refreshToken: string) => {
  // 1. verify refresh token
  let decoded: { sessionId: string };
  try {
    decoded = JwtHelper.verifyToken({
      token: refreshToken,
      secret: jwtConfig.refresh.secret,
    }) as { sessionId: string };
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  // 2. find session
  const session = await Session.findById(decoded.sessionId);
  if (!session || !session.valid) {
    throw new AppError("Session expired. Please log in again", 401);
  }

  // 3. find user
  const user = await User.findOne({ _id: session.userId, is_active: true });
  if (!user) {
    throw new AppError("User no longer exists", 401);
  }

  // 4. issue new access token
  const newAccessToken = JwtHelper.generateToken({
    data: {
      _id: user._id,
      sessionId: session._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      company_id: user.company_id ?? null,
    },
    secret: jwtConfig.access.secret,
    expiresIn: jwtConfig.access.expiresIn,
  });

  return { accessToken: newAccessToken };
};
const removeSession = async (sessionId: string, userId: string) => {
  const session = await Session.findOneAndDelete({
    _id: new Types.ObjectId(sessionId),
    userId: new Types.ObjectId(userId),
  });
  if (!session) throw new AppError("Session not found", 404);
};

export const AuthServices = {
  login,
  logout,
  refresh,
  removeSession,
};
