import { Types } from "mongoose";
import { Request } from "express";
import { RegisterCustomerInput } from "../super_admin/super_admin.validation";
interface ILogin {
    email: string;
    password: string;
}
interface IUpdatePassword {
    oldPassword: string;
    newPassword: string;
    userId: string;
    sessionId: string;
}
export declare const AuthServices: {
    login: (payload: ILogin, req: Request) => Promise<{
        user: import("../super_admin/super_admin.interface").IUserDocument & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    logout: (refreshToken: string) => Promise<void>;
    refresh: (refreshToken: string) => Promise<{
        accessToken: string;
    }>;
    removeSession: (sessionId: string, userId: string) => Promise<void>;
    updatePassword: (payload: IUpdatePassword) => Promise<{
        message: string;
    }>;
    registerCustomer: (company_id: Types.ObjectId, input: RegisterCustomerInput) => Promise<{
        comparePassword(candidatePassword: string): Promise<boolean>;
        clearSessions(): Promise<void>;
        name: string;
        email: string;
        phone: string | null;
        passwordChangedAt?: Date | null;
        role: import("../super_admin/super_admin.interface").UserRole;
        company_id: Types.ObjectId | null;
        is_active: boolean;
        email_verified: boolean;
        createdBy: Types.ObjectId | null;
        last_login: Date | null;
        reset_token: string | null;
        reset_token_exp: Date | null;
        createdAt: Date;
        updatedAt: Date;
        _id: Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
};
export {};
//# sourceMappingURL=auth.service.d.ts.map