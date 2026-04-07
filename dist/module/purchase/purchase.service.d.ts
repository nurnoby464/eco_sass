import mongoose from "mongoose";
import { CreatePurchaseInput, ListPurchaseQuery, UpdatePurchaseInput } from "./purchase.validation";
import { Request } from "express";
interface CreatePurchasePayload extends CreatePurchaseInput {
    company_id: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
}
export declare const createPurchase: (payload: CreatePurchasePayload, req: Request) => Promise<any>;
export declare const getPurchases: (company_id: mongoose.Types.ObjectId, query: ListPurchaseQuery) => Promise<{
    purchases: (import("./purchase.interface").IPurchaseDocument & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    })[];
    total: number;
}>;
export declare const getPurchaseById: (payload: {
    id: string;
    company_id: mongoose.Types.ObjectId;
}) => Promise<import("./purchase.interface").IPurchaseDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const updatePayment: (id: string, company_id: mongoose.Types.ObjectId, payload: UpdatePurchaseInput, req: Request) => Promise<mongoose.Document<unknown, {}, import("./purchase.interface").IPurchaseDocument, {}, mongoose.DefaultSchemaOptions> & import("./purchase.interface").IPurchaseDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const deletePurchase: (id: string, company_id: mongoose.Types.ObjectId, req: Request) => Promise<void>;
export {};
//# sourceMappingURL=purchase.service.d.ts.map