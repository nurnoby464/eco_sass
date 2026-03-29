import { model, Schema } from "mongoose";
import { ISessionDocument } from "./auth.interface";
import z from "zod";

const SessionSchema = new Schema<ISessionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "userId is required"],
    },

    valid: {
      type: Boolean,
      default: true,
    },

    user_agent: {
      type: String,
      default: null,
      trim: true,
    },

    ip: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// ─── Indexes ─────────────────────────────────────────────
SessionSchema.index({ userId: 1, valid: 1 }); // fast lookup: active sessions for a user
SessionSchema.index(
  { updatedAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 },
); // TTL — auto-delete after 30 days

const Session = model<ISessionDocument>("Session", SessionSchema);
export default Session;

export const loginSchema = z.object({
  email: z.email("Give a valid email").trim().toLowerCase(),
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
});
