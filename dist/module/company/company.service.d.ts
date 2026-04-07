import mongoose from "mongoose";
import { CompanyUserInput, UpdateUserInput, UserQueryInput } from "./company.validation";
import { Request } from "express";
export declare const CompanyServices: {
    createCompanyUser: (payload: CompanyUserInput, req: Request) => Promise<import("../super_admin/super_admin.interface").IUserDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getAllUsers: (query: UserQueryInput, req: Request) => Promise<{
        user: (import("../super_admin/super_admin.interface").IUserDocument & Required<{
            _id: mongoose.Types.ObjectId;
        }> & {
            __v: number;
        })[];
        page: number;
        limit: number;
        total: number;
    }>;
    getUserById: (userId: string, req: Request) => Promise<import("../super_admin/super_admin.interface").IUserDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateUser: (userId: string, payload: UpdateUserInput, req: Request) => Promise<import("../super_admin/super_admin.interface").IUserDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteUser: (userId: string, req: Request) => Promise<void>;
};
//# sourceMappingURL=company.service.d.ts.map