import { ISessionDocument } from "../interface/session.interface";
declare const Session: import("mongoose").Model<ISessionDocument, {}, {}, {}, import("mongoose").Document<unknown, {}, ISessionDocument, {}, import("mongoose").DefaultSchemaOptions> & ISessionDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISessionDocument>;
export default Session;
//# sourceMappingURL=session.schema.d.ts.map