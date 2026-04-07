import { ICompanyDocument } from "./company.interface";
declare const Company: import("mongoose").Model<ICompanyDocument, {}, {}, {}, import("mongoose").Document<unknown, {}, ICompanyDocument, {}, import("mongoose").DefaultSchemaOptions> & ICompanyDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICompanyDocument>;
export default Company;
//# sourceMappingURL=company.schema.d.ts.map