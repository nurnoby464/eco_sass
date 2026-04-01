import { Schema, model } from "mongoose";
import { AUDIT_ACTIONS, IAuditDocument } from "./audit.interface";

const PerformedBySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true },
    sessionId: { type: String, required: true },
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
    company_id: { type: Schema.Types.ObjectId, ref: "Company", default: null },
  },
  { _id: false }, // no separate _id for sub-document
);

const ChangesSchema = new Schema(
  {
    before: { type: Schema.Types.Mixed, default: null },
    after: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false },
);

const AuditSchema = new Schema<IAuditDocument>(
  {
    company_id: {
      // ← add top level
      type: Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    performedBy: { type: PerformedBySchema, required: true },

    action: {
      type: String,
      enum: Object.values(AUDIT_ACTIONS),
      required: true,
    },

    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },

    targetModel: {
      type: String,
      enum: ["User", "Company", "Session", null],
      default: null,
    },

    targetId: {
      type: Schema.Types.ObjectId,
      default: null,
    },

    changes: {
      type: ChangesSchema,
      default: () => ({ before: null, after: null }),
    },

    reason: { type: String, default: null }, // error message on failure
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // audit logs never update
    versionKey: false, // no __v field needed
  },
);

// ─── Indexes ──────────────────────────────────────────────
AuditSchema.index({ company_id              : 1, createdAt: -1 });
AuditSchema.index({ "performedBy.userId": 1, createdAt: -1 }); // user activity history
AuditSchema.index({ "performedBy.sessionId": 1 }); // which device did what
AuditSchema.index({ action: 1, createdAt: -1 }); // filter by action type
AuditSchema.index({ targetId: 1, createdAt: -1 }); // history of one resource
AuditSchema.index({ status: 1 }); // filter failed actions
AuditSchema.index({ createdAt: -1 }); // latest first

// ─── TTL — auto delete logs older than 1 year ─────────────
AuditSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 });

const Audit = model<IAuditDocument>("Audit", AuditSchema);
export default Audit;
