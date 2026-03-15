import mongoose, { Document } from "mongoose";
export interface ICompany {
    company_name: string;
    company_email: string;
    phone: string;
    address: string;
    logo: string | null;
    domain: string | null;
    subdomain: string | null;
    status: "active" | "inactive" | "suspended";
    admin_id: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface ICompanyDocument extends ICompany, Document {
}
declare const Company: mongoose.Model<ICompanyDocument, {}, {}, {}, mongoose.Document<unknown, {}, ICompanyDocument, {}, mongoose.DefaultSchemaOptions> & ICompanyDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICompanyDocument>;
export default Company;
//# sourceMappingURL=company.schema.d.ts.map