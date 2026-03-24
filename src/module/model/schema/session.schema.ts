import { model, Schema } from "mongoose";
import { ISessionDocument } from "../interface/session.interface";

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
SessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 }); // TTL — auto-delete after 30 days

const Session = model<ISessionDocument>("Session", SessionSchema);
export default Session;