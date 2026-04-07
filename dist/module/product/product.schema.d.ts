import { Schema } from "mongoose";
import { IProduct } from "./product.interface";
export declare const ProductCounter: import("mongoose").Model<{
    company_id: import("mongoose").Types.ObjectId;
    seq: number;
}, {}, {}, {
    id: string;
}, import("mongoose").Document<unknown, {}, {
    company_id: import("mongoose").Types.ObjectId;
    seq: number;
}, {
    id: string;
}, {
    collection: string;
}> & Omit<{
    company_id: import("mongoose").Types.ObjectId;
    seq: number;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, Schema<any, import("mongoose").Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    collection: string;
}, {
    company_id: import("mongoose").Types.ObjectId;
    seq: number;
}, import("mongoose").Document<unknown, {}, {
    company_id: import("mongoose").Types.ObjectId;
    seq: number;
}, {
    id: string;
}, import("mongoose").MergeType<import("mongoose").DefaultSchemaOptions, {
    collection: string;
}>> & Omit<{
    company_id: import("mongoose").Types.ObjectId;
    seq: number;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, unknown, {
    company_id: import("mongoose").Types.ObjectId;
    seq: number;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>, {
    company_id: import("mongoose").Types.ObjectId;
    seq: number;
} & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
declare const Product: import("mongoose").Model<IProduct, {}, {}, {}, import("mongoose").Document<unknown, {}, IProduct, {}, import("mongoose").DefaultSchemaOptions> & IProduct & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}, any, IProduct>;
export default Product;
//# sourceMappingURL=product.schema.d.ts.map