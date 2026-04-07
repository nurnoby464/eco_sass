import { Types } from "mongoose";
import { Request } from "express";
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
};
export {};
//# sourceMappingURL=auth.service.d.ts.map