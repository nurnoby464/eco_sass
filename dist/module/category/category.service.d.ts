import mongoose from "mongoose";
import { Request } from "express";
export declare const createCategory: (payload: {
    company_id: mongoose.Types.ObjectId;
    name: string;
    parent_id?: string | null;
    image?: string | null;
    createdBy: mongoose.Types.ObjectId;
    req: Request;
}) => Promise<mongoose.Document<unknown, {}, import("./category.interface").ICategoryDocument, {}, mongoose.DefaultSchemaOptions> & import("./category.interface").ICategoryDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const getCategories: (payload: {
    company_id: mongoose.Types.ObjectId;
    page: number;
    limit: number;
    search?: string;
    parent_id?: string | null;
    depth?: number;
    is_active?: boolean;
}) => Promise<{
    categories: (import("./category.interface").ICategoryDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    })[];
    total: number;
}>;
export declare const getCategoryTree: (payload: {
    company_id: mongoose.Types.ObjectId;
    id: string;
}) => Promise<{
    root: import("./category.interface").ICategoryDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    };
    descendants: (import("./category.interface").ICategoryDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    })[];
}>;
export declare const getCategoryById: (payload: {
    id: string;
    company_id: mongoose.Types.ObjectId;
}) => Promise<import("./category.interface").ICategoryDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const updateCategory: (payload: {
    id: string;
    company_id: mongoose.Types.ObjectId;
    req: Request;
    data: {
        name?: string;
        image?: string | null;
        is_active?: boolean;
    };
}) => Promise<mongoose.Document<unknown, {}, import("./category.interface").ICategoryDocument, {}, mongoose.DefaultSchemaOptions> & import("./category.interface").ICategoryDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const deleteCategory: (payload: {
    id: string;
    company_id: mongoose.Types.ObjectId;
    req: Request;
}) => Promise<mongoose.Document<unknown, {}, import("./category.interface").ICategoryDocument, {}, mongoose.DefaultSchemaOptions> & import("./category.interface").ICategoryDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
//# sourceMappingURL=category.service.d.ts.map