import mongoose, { Document } from "mongoose";

export interface IVendorNote {
  _id       : mongoose.Types.ObjectId;
  text      : string;
  createdBy : mongoose.Types.ObjectId;
  createdAt : Date;
}
 
export interface IVendor {
  company_id     : mongoose.Types.ObjectId;
  name           : string;
  phone          : string;
  email          : string | null;
  address        : string | null;
  notes : IVendorNote[];
 
  // ── financials — updated on every purchase ────────────
  total_payable  : number;   // lifetime total owed
  total_paid     : number;   // lifetime total paid
  due            : number;   // total_payable - total_paid
 
  is_active      : boolean;
  createdBy      : mongoose.Types.ObjectId;
  createdAt      : Date;
  updatedAt      : Date;
}
 
export interface IVendorDocument extends IVendor, Document {}