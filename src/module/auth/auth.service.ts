import { jwtConfig } from "./../../config/jwt.config";
import { Request } from "express";
import { AppError } from "../../middlewares/appError";
import { ITokenPayload, JwtHelper } from "../../utils/jwtHelper";
import User from "../super_admin/super_admin.schema";
import { Secret } from "jsonwebtoken";
import Session from "./auth.schema";

interface ILogin {
  email: string;
  password: string;
}
const login = async (payload: ILogin, req: Request) => {
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
  const session = await Session.create({
    userId: existing._id,
    valid: true,
    user_agent: req.headers["user-agent"] ?? null,
    ip: req.ip ?? null,
  });
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
  console.log(decoded);
  //   await Session.findByIdAndUpdate(decoded.sessionId, { valid: false });
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

export const AuthServices = {
  login,
  logout,
  refresh,
};
