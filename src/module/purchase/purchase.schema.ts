import { model, Schema } from "mongoose";
import { IPurchaseDocument, IPurchaseItem } from "./purchase.interface";

const PurchaseItemSchema = new Schema(
  {
    product_id  : { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variant_id  : { type: Schema.Types.ObjectId, ref: "ProductVariant", default: null },
    product_name: { type: String, required: true },  // snapshot
    sku         : { type: String, required: true },  // snapshot
    quantity    : { type: Number, required: true, min: 1 },
    unit_price  : { type: Number, required: true, min: 0 },
    total       : { type: Number, required: true, min: 0 }, // auto: quantity * unit_price
  },
  { _id: false }
);
 
const PurchaseSchema = new Schema<IPurchaseDocument>(
  {
    company_id : { type: Schema.Types.ObjectId, ref: "Company", required: true },
    vendor_id  : { type: Schema.Types.ObjectId, ref: "Vendor",  required: true },
 
    items: {
      type    : [PurchaseItemSchema],
      required: true,
      validate: {
        validator: (v: IPurchaseItem[]) => v.length > 0,
        message  : "Purchase must have at least one item",
      },
    },
 
    // ── financials ─────────────────────────────────────
    total_amount: { type: Number, required: true, min: 0 },
    paid_amount : { type: Number, default: 0,     min: 0 },
    due_amount  : { type: Number, default: 0,     min: 0 }, // auto calculated
 
    status: {
      type    : String,
      enum    : ["pending", "partial", "paid"],
      default : "pending",
    },
 
    purchase_date: { type: Date, default: Date.now },
    note         : { type: String, default: null, trim: true },
 
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);
 
// ─── Auto calculate due + status before save ─────────────
PurchaseSchema.pre("save", function () {
  this.due_amount = this.total_amount - this.paid_amount;
 
  if (this.paid_amount <= 0) {
    this.status = "pending";
  } else if (this.paid_amount >= this.total_amount) {
    this.status  = "paid";
    this.due_amount = 0;
  } else {
    this.status = "partial";
  }
});
 
// ─── Indexes ──────────────────────────────────────────────
PurchaseSchema.index({ company_id: 1, createdAt: -1 });
PurchaseSchema.index({ company_id: 1, vendor_id: 1, createdAt: -1 });
PurchaseSchema.index({ company_id: 1, status: 1 });     // filter by pending/partial
PurchaseSchema.index({ vendor_id: 1, status: 1 });
 
const Purchase = model<IPurchaseDocument>("Purchase", PurchaseSchema);
export default Purchase;