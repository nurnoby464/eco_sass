"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const session_schema_1 = __importDefault(require("../model/schema/session.schema"));
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
        minlength: [2, "Name must be at least 2 characters"],
        maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [8, "Password must be at least 8 characters"],
        select: false,
    },
    role: {
        type: String,
        required: [true, "Role is required"],
        enum: {
            values: [
                "super_admin",
                "admin",
                "account",
                "site_management",
                "inventory",
                "sales",
                "report",
            ],
            message: "Invalid role: {VALUE}",
        },
    },
    company_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Company",
        default: null,
        // null for super_admin | set for admin and all role users
    },
    is_active: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    last_login: { type: Date, default: null },
    reset_token: { type: String, default: null, select: false },
    reset_token_exp: { type: Date, default: null, select: false },
}, {
    timestamps: true,
});
// ─── Indexes ─────────────────────────────────────────────
UserSchema.index({ email: 1 });
UserSchema.index({ company_id: 1, role: 1 });
UserSchema.index({ createdBy: 1 });
// ─── Virtual: sessions ────────────────────────────────────
// Lets you do user.populate("sessions") to get all sessions for this user.
// No data is stored on the User document itself.
UserSchema.virtual("sessions", {
    ref: "Session",
    localField: "_id",
    foreignField: "userId",
});
// ─── Pre-save: hash password ──────────────────────────────
UserSchema.pre("save", async function () {
    if (!this.isModified("password"))
        return;
    const salt = await bcryptjs_1.default.genSalt(12);
    this.password = await bcryptjs_1.default.hash(this.password, salt);
});
// ─── Method: compare password ─────────────────────────────
UserSchema.methods.comparePassword = async function (plainPassword) {
    return bcryptjs_1.default.compare(plainPassword, this.password);
};
// ─── Method: invalidate all sessions ─────────────────────
// Call this on logout-all or password change to kill every active session.
UserSchema.methods.clearSessions = async function () {
    // const Session = (await import("./session.schema")).default;
    await session_schema_1.default.updateMany({ userId: this._id, valid: true }, { valid: false });
};
// ─── toJSON: strip sensitive fields ──────────────────────
UserSchema.set("toJSON", {
    virtuals: false, // don't expose sessions array by default in JSON
    transform: (_doc, ret) => {
        const obj = ret;
        delete obj.password;
        delete obj.reset_token;
        delete obj.reset_token_exp;
        return obj;
    },
});
const User = (0, mongoose_1.model)("User", UserSchema);
exports.default = User;
//# sourceMappingURL=super_admin.schema.js.map