import { Request } from "express";
import { GetProductQuery } from "../product/product.validation";
import { GetProductParamsQuery } from "./public.validation";
import { Types } from "mongoose";
export declare const getProduct: (req: Request, query: GetProductQuery) => Promise<{
    products: (import("../product/product.interface").IProduct & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[];
    total: number;
    page: number;
    limit: number;
}>;
export declare const dbTest: (req: Request, query: GetProductQuery) => Promise<{
    products: (import("../product/product.interface").IProduct & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[];
    total: number;
    page: number;
    limit: number;
}>;
export declare const getProductById: (payload: GetProductParamsQuery, req: Request) => Promise<{
    products: (import("../product/product.interface").IProduct & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }) | null;
    variant: (import("../product-variant/product-variant.interface").IProductVariantDocument & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[] | null;
}>;
export declare const getAllCategories: (req: Request) => Promise<(import("../category/category.interface").ICategoryDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
})[]>;
//# sourceMappingURL=public.service.d.ts.map