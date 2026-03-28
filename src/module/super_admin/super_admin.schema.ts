import { model, Schema } from "mongoose";
import { IUserDocument } from "./super_admin.interface";
import bcrypt from "bcryptjs"
import Session from "../auth/auth.schema";

const UserSchema = new Schema<IUserDocument>(
  {
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
      type: Schema.Types.ObjectId,
      ref: "Company",
      default: null,
      // null for super_admin | set for admin and all role users
    },

    is_active: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    last_login: { type: Date, default: null },
    reset_token: { type: String, default: null, select: false },
    reset_token_exp: { type: Date, default: null, select: false },
  },
  {
    timestamps: true,
  },
);

// ─── Indexes ─────────────────────────────────────────────
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
UserSchema.pre<IUserDocument>("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Method: compare password ─────────────────────────────
UserSchema.methods.comparePassword = async function (plainPassword: string) {
  return bcrypt.compare(plainPassword, this.password);
};

// ─── Method: invalidate all sessions ─────────────────────
// Call this on logout-all or password change to kill every active session.
UserSchema.methods.clearSessions = async function () {
  // const Session = (await import("./session.schema")).default;
  await Session.updateMany({ userId: this._id, valid: true }, { valid: false });
};

// ─── toJSON: strip sensitive fields ──────────────────────
UserSchema.set("toJSON", {
  virtuals: false, // don't expose sessions array by default in JSON
  transform: (_doc, ret) => {
    const obj = ret as any;
    delete obj.password;
    delete obj.reset_token;
    delete obj.reset_token_exp;
    return obj;
  },
});

const User = model<IUserDocument>("User", UserSchema);
export default User;