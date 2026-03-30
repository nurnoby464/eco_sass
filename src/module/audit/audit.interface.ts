import mongoose, { Document } from "mongoose";
 
// ─── All possible actions ─────────────────────────────────
export const AUDIT_ACTIONS = {
  // Auth
  LOGIN           : "LOGIN",
  LOGIN_FAILED    : "LOGIN_FAILED",
  LOGOUT          : "LOGOUT",
  PASSWORD_CHANGED: "PASSWORD_CHANGED",
  TOKEN_REFRESHED : "TOKEN_REFRESHED",
 
  // Company
  COMPANY_CREATED : "COMPANY_CREATED",
  COMPANY_UPDATED : "COMPANY_UPDATED",
  COMPANY_DELETED : "COMPANY_DELETED",
 
  // User
  USER_CREATED    : "USER_CREATED",
  USER_UPDATED    : "USER_UPDATED",
  USER_DELETED    : "USER_DELETED",
  USER_ACTIVATED  : "USER_ACTIVATED",
  USER_DEACTIVATED: "USER_DEACTIVATED",
 
  // Session
  SESSION_REMOVED : "SESSION_REMOVED",
} as const;
 
// derive union type from the object values
export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
 
// ─── Who performed the action ─────────────────────────────
export interface IPerformedBy {
  userId    : mongoose.Types.ObjectId;
  name      : string;
  email     : string;
  role      : string;
  sessionId : string;           // which device triggered this
  ip        : string | null;
  userAgent : string | null;
}
 
// ─── What was changed (before/after) ─────────────────────
export interface IChanges {
  before : Record<string, unknown> | null; // state before change
  after  : Record<string, unknown> | null; // state after change
}
 
// ─── Main audit interface ─────────────────────────────────
export interface IAudit {
  performedBy : IPerformedBy;
  action      : AuditAction;
  status      : "success" | "failed";
 
  // target — what was acted upon
  targetModel : "User" | "Company" | "Session" | null;
  targetId    : mongoose.Types.ObjectId | null;
 
  // optional detail
  changes     : IChanges;          // what changed (before/after)
  reason      : string | null;     // why it failed (error message)
 
  createdAt   : Date;
}
 
export interface IAuditDocument extends IAudit, Document {}