
import { model, Schema } from "mongoose";
import ProductVariant     from "../product-variant/product-variant.schema";
import Product            from "../product/product.schema";
import Vendor             from "../vendor/vendor.schema";
import Company            from "../company/company.schema"; // adjust path
import { IPurchaseDocument, IPurchaseItem } from "./purchase.interface";

const PurchaseItemSchema = new Schema(
  {
    product_id   : { type: Schema.Types.ObjectId, ref: "Product",        required: true },
    variant_id   : { type: Schema.Types.ObjectId, ref: "ProductVariant", default: null },
    product_name : { type: String, required: true },   // snapshot
    sku          : { type: String, required: true },   // snapshot
    quantity     : { type: Number, required: true, min: 1 },
    unit_price   : { type: Number, required: true, min: 0 },
    selling_price: { type: Number, required: true, min: 0 }, // ← NEW
    total        : { type: Number, required: true, min: 0 }, // quantity * unit_price
  },
  { _id: false }
);

const PurchaseSchema = new Schema<IPurchaseDocument>(
  {
    company_id: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    vendor_id : { type: Schema.Types.ObjectId, ref: "Vendor",  required: true },

    items: {
      type    : [PurchaseItemSchema],
      required: true,
      validate: {
        validator: (v: IPurchaseItem[]) => v.length > 0,
        message  : "Purchase must have at least one item",
      },
    },

    // financials
    total_amount: { type: Number, required: true, min: 0 },
    paid_amount : { type: Number, default: 0,     min: 0 },
    due_amount  : { type: Number, default: 0,     min: 0 },

    status: {
      type   : String,
      enum   : ["pending", "partial", "paid"],
      default: "pending",
    },

    purchase_date: { type: Date, default: Date.now },
    note         : { type: String, default: null, trim: true },
    createdBy    : { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// ── Auto calculate due + payment status ──────────────────────────────────────
PurchaseSchema.pre("save", function () {
  this.due_amount = parseFloat(
    (this.total_amount - this.paid_amount).toFixed(2)
  );

  if (this.paid_amount <= 0) {
    this.status = "pending";
  } else if (this.paid_amount >= this.total_amount) {
    this.status     = "paid";
    this.due_amount = 0;
  } else {
    this.status = "partial";
  }
});

// ── After save: update stock + vendor financials ──────────────────────────────
//
//   This fires ONLY on new purchases (isNew).
//   It checks company.settings.auto_confirm_purchase:
//     true  → update stock immediately (small company, single user)
//     false → do NOT update stock yet; warehouse staff confirms later
//
PurchaseSchema.post("save", async function (doc) {
  if (!this.isNew) return; // only on creation, not on paid_amount updates

  try {
    // ── 1. Check company auto_confirm setting ───────────────────────────────
    const company = await Company.findById(doc.company_id).lean<any>();
    const autoConfirm = company?.settings?.auto_confirm_purchase ?? true;
    // default true — safe for single-user companies

    if (autoConfirm) {
      // ── 2. Update stock for every line item ────────────────────────────────
      for (const item of doc.items) {
        if (item.variant_id) {
          // Product with variants → update variant stock
          await ProductVariant.findByIdAndUpdate(item.variant_id, {
            $inc: { stock: item.quantity },
          });
        } else {
          // Simple product (no variants) → update product stock
          await Product.findByIdAndUpdate(item.product_id, {
            $inc: { stock: item.quantity },
          });
        }
      }
    }

    // ── 3. Always update vendor financials ─────────────────────────────────
    //    (regardless of auto_confirm — the debt is created the moment you buy)
    await Vendor.findByIdAndUpdate(doc.vendor_id, {
      $inc: {
        total_payable: doc.total_amount,
        due          : doc.due_amount,
        total_paid   : doc.paid_amount,
      },
    });

  } catch (err) {
    // post-save hooks can't abort the transaction, but we log so nothing is silent
    console.error("[Purchase post-save] stock/vendor update failed:", err);
  }
});

// ── Indexes ───────────────────────────────────────────────────────────────────
PurchaseSchema.index({ company_id: 1, createdAt: -1 });
PurchaseSchema.index({ company_id: 1, vendor_id: 1, createdAt: -1 });
PurchaseSchema.index({ company_id: 1, status: 1 });
PurchaseSchema.index({ vendor_id: 1,  status: 1 });

const Purchase = model<IPurchaseDocument>("Purchase", PurchaseSchema);
export default Purchase;


// ─── company.schema.ts  (only the settings part — add to your existing schema) ─
//
//  Add this field inside your CompanySchema:
//
//  settings: {
//    auto_confirm_purchase: { type: Boolean, default: true },
//    // true  = stock updates instantly when PO is created (small/single-user company)
//    // false = stock updates only after warehouse staff confirms receipt
//  }
//
//  Example: when a company grows and hires warehouse staff:
//  PATCH /api/v1/companies/settings
//  { "auto_confirm_purchase": false }