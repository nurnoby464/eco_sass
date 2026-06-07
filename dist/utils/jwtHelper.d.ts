import { Secret } from "jsonwebtoken";
import mongoose from "mongoose";
import type { StringValue } from "ms";
import { UserRole } from "../module/super_admin/super_admin.interface";
export interface ITokenPayload {
    _id: mongoose.Types.ObjectId;
    email: string;
    name: string;
    role: UserRole;
    profileId: mongoose.Types.ObjectId | null;
    profileType: "Customer" | "Staff" | null;
    company_id: mongoose.Types.ObjectId | null;
    sessionId: string;
    passwordChangedAt: number | null;
    iat?: number;
    exp?: number;
}
interface IGenerateToken {
    data: ITokenPayload;
    secret: Secret;
    expiresIn: StringValue;
}
interface IVerifyToken {
    token: string;
    secret: string;
}
export declare const JwtHelper: {
    generateToken: (payload: IGenerateToken) => string;
    verifyToken: (payload: IVerifyToken) => ITokenPayload;
};
export {};
//# sourceMappingURL=jwtHelper.d.ts.map