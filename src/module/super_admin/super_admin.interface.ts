import mongoose, { Document } from "mongoose";

export type UserRole =
  | "super_admin"
  | "admin"
  | "account"
  | "site_management"
  | "inventory"
  | "sales"
  | "report";

export interface IUser {
  name: string;
  email: string;
  password: string;
  passwordChangedAt?: Date | null;
  role: UserRole;
  company_id: mongoose.Types.ObjectId | null;
  is_active: boolean;
  createdBy: mongoose.Types.ObjectId | null;
  last_login: Date | null;
  reset_token: string | null;
  reset_token_exp: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  clearSessions(): Promise<void>;
}
