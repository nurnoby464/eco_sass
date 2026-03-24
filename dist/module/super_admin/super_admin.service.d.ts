import mongoose from 'mongoose';
import { ParsedQs } from 'qs';
import { IUserDocument } from './super_admin.interface';
import { CreateUserInput } from './super_admin.validation';
interface ListQuery extends ParsedQs {
    page?: string;
    limit?: string;
    company_id?: string;
    role?: string;
    is_active?: string;
}
interface ListResult {
    users: Record<string, any>[];
    total: number;
    page: number;
    limit: number;
}
export declare const UserService: {
    createUser: (input: CreateUserInput, createdBy: mongoose.Types.ObjectId | null) => Promise<IUserDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getUserById: (id: string) => Promise<IUserDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
    listUsers: (rawQuery: ListQuery) => Promise<ListResult>;
    deleteUser: (id: string, requestor: IUserDocument) => Promise<void>;
    toggleUserStatus: (id: string, requestor: IUserDocument) => Promise<IUserDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    }>;
};
export {};
//# sourceMappingURL=super_admin.service.d.ts.map