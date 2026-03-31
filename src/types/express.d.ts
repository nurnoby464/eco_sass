import mongoose from "mongoose";

// ─── Extend Express Request ───────────────────────────────
declare global {
  namespace Express {
    interface Request {
      user: {
        _id: mongoose.Types.ObjectId;
        email: string;
        name: string;
        role: string;
        company_id: mongoose.Types.ObjectId | null;
        sessionId: string;
        passwordChangedAt: number | null;
        iat?: number; 
        exp?: number;
      };
      validatedQuery : Record<string, unknown>;
    }
  }
}
export {};
