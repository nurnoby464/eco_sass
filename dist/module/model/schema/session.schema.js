"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SessionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
// ─── Indexes ─────────────────────────────────────────────
SessionSchema.index({ userId: 1, valid: 1 }); // fast lookup: active sessions for a user
SessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 }); // TTL — auto-delete after 30 days
const Session = (0, mongoose_1.model)("Session", SessionSchema);
exports.default = Session;
//# sourceMappingURL=session.schema.js.map