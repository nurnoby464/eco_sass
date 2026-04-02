import mongoose from "mongoose";
import { Document } from "mongoose";

export interface IPurchaseItem {
  product_id   : mongoose.Types.ObjectId;
  variant_id   : mongoose.Types.ObjectId | null; // null if no variant
  product_name : string;                          // snapshot at purchase time
  sku          : string;                          // snapshot
  quantity     : number;
  unit_price   : number;                          // buying price at time of purchase
  total        : number;                          // quantity * unit_price
}
 
export interface IPurchase {
  company_id    : mongoose.Types.ObjectId;
  vendor_id     : mongoose.Types.ObjectId;
 
  items         : IPurchaseItem[];
 
  // ── financials ────────────────────────────────────────
  total_amount  : number;   // sum of all items
  paid_amount   : number;   // how much paid so far
  due_amount    : number;   // total_amount - paid_amount
 
  status        : "pending" | "partial" | "paid";
  // pending = nothing paid
  // partial = some paid
  // paid    = fully paid
 
  purchase_date : Date;
  note          : string | null;
  createdBy     : mongoose.Types.ObjectId;
  createdAt     : Date;
  updatedAt     : Date;
}
 
export interface IPurchaseDocument extends IPurchase, Document {}