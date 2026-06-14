import mongoose, { Types } from "mongoose";
import { ICompanyDocument } from "./company.interface";
import { CompanyUserInput, UpdateCompanyInput, UpdateSocialMediaInput, UpdateUserInput, UserQueryInput } from "./company.validation";
import { Request } from "express";
export declare const CompanyServices: {
    createCompanyUser: (payload: CompanyUserInput, req: Request) => Promise<import("../super_admin/super_admin.interface").IUserDocument & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getAllUsers: (query: UserQueryInput, req: Request) => Promise<{
        user: (import("../super_admin/super_admin.interface").IUserDocument & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        })[];
        page: number;
        limit: number;
        total: number;
    }>;
    getUserById: (userId: string, req: Request) => Promise<import("../super_admin/super_admin.interface").IUserDocument & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    updateUser: (userId: string, payload: UpdateUserInput, req: Request) => Promise<import("../super_admin/super_admin.interface").IUserDocument & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteUser: (userId: string, req: Request) => Promise<void>;
    getMyCompany: (id: Types.ObjectId) => Promise<(mongoose.Document<unknown, {}, ICompanyDocument, {}, mongoose.DefaultSchemaOptions> & ICompanyDocument & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    updateMyCompany: (companyId: Types.ObjectId, data: UpdateCompanyInput) => Promise<(ICompanyDocument & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
    updateSocialMedia: (companyId: Types.ObjectId, data: UpdateSocialMediaInput) => Promise<(ICompanyDocument & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }) | null>;
};
//# sourceMappingURL=company.service.d.ts.map