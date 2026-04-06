import mongoose from "mongoose";
import { UserRole } from "../module/super_admin/super_admin.interface";

// ─── Extend Express Request ───────────────────────────────
declare global {
  namespace Express {
    interface Request {
      user: {
        _id: mongoose.Types.ObjectId;
        email: string;
        name: string;
        role: UserRole;
        company_id: mongoose.Types.ObjectId | null;
        sessionId: string;
        passwordChangedAt: number | null;
        iat?: number; 
        exp?: number;
      };
      validatedQuery : Record<string, unknown>;
      company?:{
        _id: mongoose.Types.ObjectId;
        company_name: string;
        logo: string | null;
        subdomain: string | null;
        domain: string | null;
        status: "active" | "inactive" | "suspended";
      }
    }
  }
}
export {};
