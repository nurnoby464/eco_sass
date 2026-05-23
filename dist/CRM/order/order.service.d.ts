import mongoose, { Types } from "mongoose";
import { ICreateOrderPayload } from "./order.interface";
import { TGetOrderListQuery } from "./order.validation";
export declare const createOrder: ({ companyId, input, }: ICreateOrderPayload) => Promise<mongoose.Document<unknown, {}, import("./order.interface").IOrderDocument, {}, mongoose.DefaultSchemaOptions> & import("./order.interface").IOrderDocument & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}>;
export declare const getAllOrder: (companyId: Types.ObjectId, query: TGetOrderListQuery) => Promise<{
    orders: (import("./order.interface").IOrderDocument & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[];
    total: number;
    orderStatusCounts: any;
}>;
//# sourceMappingURL=order.service.d.ts.map