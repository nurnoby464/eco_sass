import { Schema } from "mongoose";
import { IVendorDocument } from "./vendor.interface";
export declare const VendorCounter: import("mongoose").Model<{
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
declare const Vendor: import("mongoose").Model<IVendorDocument, {}, {}, {}, import("mongoose").Document<unknown, {}, IVendorDocument, {}, import("mongoose").DefaultSchemaOptions> & IVendorDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IVendorDocument>;
export default Vendor;
//# sourceMappingURL=vendor.schema.d.ts.map