import { model, Schema } from "mongoose";
import { IUserDocument } from "./super_admin.interface";
import bcrypt from "bcryptjs";

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
      select: false, // never returned in queries by default
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
    timestamps: true, // adds createdAt and updatedAt automatically
  },
);

// ─── Indexes ─────────────────────────────────────────────
UserSchema.index({ email: 1 }); // unique login lookup
UserSchema.index({ company_id: 1, role: 1 }); // list users by company + role
UserSchema.index({ createdBy: 1 }); // who created this user

UserSchema.pre<IUserDocument>("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (plainPassword: string) {
  return bcrypt.compare(plainPassword, this.password);
};

UserSchema.set("toJSON", {
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
