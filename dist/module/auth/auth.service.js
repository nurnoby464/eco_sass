"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServices = void 0;
const appError_1 = require("./../../middlewares/appError");
const mongoose_1 = require("mongoose");
const jwt_config_1 = require("./../../config/jwt.config");
const appError_2 = require("../../middlewares/appError");
const jwtHelper_1 = require("../../utils/jwtHelper");
const super_admin_schema_1 = __importDefault(require("../super_admin/super_admin.schema"));
const auth_schema_1 = __importDefault(require("./auth.schema"));
const login = async (payload, req) => {
    const MAX_SESSIONS = 6;
    const { email, password } = payload;
    const existing = await super_admin_schema_1.default.findOne({ email, is_active: true }).select("+password");
    if (!existing) {
        throw new appError_2.AppError("This email user not found", 400);
    }
    const isMatch = await existing.comparePassword(password);
    if (!isMatch) {
        throw new appError_2.AppError("Password incorrect!", 400);
    }
    //check session limit
    const activeSessions = await auth_schema_1.default.find({
        userId: existing._id,
        valid: true,
    })
        .sort({ updatedAt: -1 }) // newest first for display
        .select("_id user_agent userId ip createdAt updatedAt")
        .lean();
    if (activeSessions.length >= MAX_SESSIONS) {
        const sessionList = activeSessions?.map((session) => ({
            sessionId: session._id.toString(),
            user_agent: session.user_agent,
            userId: session.userId.toString(),
            ip: session.ip,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
        }));
        throw new appError_1.SessionLimitError(sessionList);
    }
    // await enforceSessionLimit(existing._id);
    // Layer 1 — reuse or create session
    const session = await auth_schema_1.default.findOneAndUpdate({
        userId: existing._id,
        valid: true,
        user_agent: req.headers["user-agent"] ?? null,
    }, {
        $set: {
            ip: req.ip ?? null,
        },
        $setOnInsert: {
            userId: existing._id,
            valid: true,
            user_agent: req.headers["user-agent"] ?? null,
        },
    }, {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
    });
    if (!session) {
        throw new appError_2.AppError("Session created failed");
    }
    const data = {
        _id: existing._id,
        email: existing.email,
        name: existing.name,
        role: existing.role,
        company_id: existing.company_id ?? null,
        sessionId: session._id.toString(),
        passwordChangedAt: existing.passwordChangedAt?.getTime() ?? null
    };
    const accessToken = await jwtHelper_1.JwtHelper.generateToken({
        data,
        secret: jwt_config_1.jwtConfig.access.secret,
        expiresIn: jwt_config_1.jwtConfig.access.expiresIn,
    });
    const refreshToken = await jwtHelper_1.JwtHelper.generateToken({
        data,
        secret: jwt_config_1.jwtConfig.refresh.secret,
        expiresIn: jwt_config_1.jwtConfig.refresh.expiresIn,
    });
    const result = await super_admin_schema_1.default.findByIdAndUpdate(existing._id, { last_login: new Date() }, { returnDocument: "after", runValidators: true });
    if (!result) {
        throw new appError_2.AppError("Last login not updated");
    }
    const user = result.toJSON();
    return {
        user,
        accessToken,
        refreshToken,
    };
};
// ─── Logout ───────────────────────────────────────────────
const logout = async (refreshToken) => {
    if (!refreshToken)
        throw new appError_2.AppError("Already logged out", 400);
    const decoded = jwtHelper_1.JwtHelper.verifyToken({
        token: refreshToken,
        secret: jwt_config_1.jwtConfig.refresh.secret,
    });
    if (!decoded) {
        throw new appError_2.AppError("Token data not found", 400);
    }
    await auth_schema_1.default.findByIdAndUpdate(decoded.sessionId, {
        valid: false,
    });
};
// ─── Refresh ──────────────────────────────────────────────
const refresh = async (refreshToken) => {
    // 1. verify refresh token
    let decoded;
    try {
        decoded = jwtHelper_1.JwtHelper.verifyToken({
            token: refreshToken,
            secret: jwt_config_1.jwtConfig.refresh.secret,
        });
    }
    catch {
        throw new appError_2.AppError("Invalid or expired refresh token", 401);
    }
    // 2. find session
    const session = await auth_schema_1.default.findById(decoded.sessionId);
    if (!session || !session.valid) {
        throw new appError_2.AppError("Session expired. Please log in again", 401);
    }
    // 3. find user
    const user = await super_admin_schema_1.default.findOne({ _id: session.userId, is_active: true });
    if (!user) {
        throw new appError_2.AppError("User no longer exists", 401);
    }
    // 4. issue new access token
    const newAccessToken = jwtHelper_1.JwtHelper.generateToken({
        data: {
            _id: user._id,
            sessionId: session._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            company_id: user.company_id ?? null,
            passwordChangedAt: user.passwordChangedAt?.getTime() ?? null
        },
        secret: jwt_config_1.jwtConfig.access.secret,
        expiresIn: jwt_config_1.jwtConfig.access.expiresIn,
    });
    return { accessToken: newAccessToken };
};
const removeSession = async (sessionId, userId) => {
    const session = await auth_schema_1.default.findOneAndDelete({
        _id: new mongoose_1.Types.ObjectId(sessionId),
        userId: new mongoose_1.Types.ObjectId(userId),
    });
    if (!session)
        throw new appError_2.AppError("Session not found", 404);
};
const updatePassword = async (payload) => {
    const { userId, sessionId, oldPassword, newPassword } = payload;
    const user = await super_admin_schema_1.default.findOne({
        _id: new mongoose_1.Types.ObjectId(userId),
        is_active: true,
    }).select("+password");
    if (!user)
        throw new appError_2.AppError("User not found", 404);
    // check old password
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch)
        throw new appError_2.AppError("Old password is incorrect", 400);
    // check new password is same as old password
    const isSame = await user.comparePassword(newPassword);
    if (isSame) {
        throw new appError_2.AppError("New password must be different from old password", 400);
    }
    // update password
    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();
    await auth_schema_1.default.deleteMany({
        userId: user._id,
        _id: { $ne: new mongoose_1.Types.ObjectId(sessionId) },
    });
    return {
        message: "Password updated. All other sessions have been logged out.",
    };
};
const registerCustomer = async (company_id, input) => {
    const { name, phone, email, password } = input;
    // 1. check duplicate phone under same company
    const existing = await super_admin_schema_1.default.findOne({
        company_id,
        email,
        role: "customer",
    });
    if (existing) {
        throw new appError_2.AppError("This email already registered", 409);
    }
    // 3. create user — NO customer CRM doc yet
    const user = await super_admin_schema_1.default.create({
        company_id,
        name,
        email,
        password,
        role: "customer",
        is_active: true,
    });
    // 4. strip password before returning
    const { password: _, ...safeUser } = user.toObject();
    return safeUser;
};
exports.AuthServices = {
    login,
    logout,
    refresh,
    removeSession,
    updatePassword,
    registerCustomer
};
//# sourceMappingURL=auth.service.js.map