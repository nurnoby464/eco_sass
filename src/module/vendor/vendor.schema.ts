import { Schema, model } from "mongoose";
import { IVendorDocument } from "./vendor.interface";

const VendorNoteSchema = new Schema(
  {
    text: { type: String, required: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }, // keep _id so you can delete a specific note later
);

const VendorSchema = new Schema<IVendorDocument>(
  {
    company_id: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "company_id is required"],
    },

    name: {
      type: String,
      required: [true, "Vendor name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [200, "Name cannot exceed 200 characters"],
    },

    phone: {
      type: String,
      required: [true, "Phone is required"],
      trim: true,
    },

    email: { type: String, default: null, lowercase: true, trim: true },
    address: { type: String, default: null, trim: true },
    notes: { type: [VendorNoteSchema], default: [] },

    // ── financials ─────────────────────────────────────
    total_payable: { type: Number, default: 0, min: 0 },
    total_paid: { type: Number, default: 0, min: 0 },
    due: { type: Number, default: 0, min: 0 }, // auto = total_payable - total_paid

    is_active: { type: Boolean, default: true },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

// ─── Indexes ──────────────────────────────────────────────
VendorSchema.index({ company_id: 1, is_active: 1 });
VendorSchema.index({ company_id: 1, name: 1 }); // search by name within company
VendorSchema.index({ company_id: 1, due: -1 }); // sort by highest due

const Vendor = model<IVendorDocument>("Vendor", VendorSchema);
export default Vendor;
