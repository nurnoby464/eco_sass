import { model, Schema } from "mongoose";
import { ICustomerDocument } from "./customer.interface";
import { boolean } from "zod";

const customerSchema = new Schema<ICustomerDocument>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: null, trim: true },
    address: { type: String, default: null, trim: true },

    totalPurchased: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    due: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },

    //CRM
    tags: { type: [String], default: [] },
    lastPurchasedAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

customerSchema.index({ companyId: 1, phone: 1 }, { unique: true });
customerSchema.index({ companyId: 1, due: -1 });       // desending order due report
customerSchema.index({ companyId: 1, lastPurchasedAt: -1 }); // recent customers

const Customer = model<ICustomerDocument>("Customer",customerSchema);
export default Customer

