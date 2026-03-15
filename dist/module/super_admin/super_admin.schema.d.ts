import { IUserDocument } from "./super_admin.interface";
declare const User: import("mongoose").Model<IUserDocument, {}, {}, {}, import("mongoose").Document<unknown, {}, IUserDocument, {}, import("mongoose").DefaultSchemaOptions> & IUserDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUserDocument>;
export default User;
//# sourceMappingURL=super_admin.schema.d.ts.map