"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PurchaseSchema = new mongoose_1.Schema({
    company_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Company", required: true },
    vendor_id: { type: mongoose_1.Schema.Types.ObjectId, ref: "Vendor", required: true },
    // ── Summary only ──────────────────────────────────────
    product_ids: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Product" }], // unique products
    item_count: { type: Number, required: true },
    // financials
    total_amount: { type: Number, required: true, min: 0 },
    paid_amount: { type: Number, default: 0, min: 0 },
    due_amount: { type: Number, default: 0, min: 0 },
    status: {
        type: String,
        enum: ["pending", "partial", "paid"],
        default: "pending",
    },
    purchase_date: { type: Date, default: Date.now },
    note: { type: String, default: null, trim: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
// ── Auto calculate due + payment status ──────────────────────────────────────
PurchaseSchema.pre("save", function () {
    this.due_amount = parseFloat((this.total_amount - this.paid_amount).toFixed(2));
    if (this.paid_amount <= 0) {
        this.status = "pending";
    }
    else if (this.paid_amount >= this.total_amount) {
        this.status = "paid";
        this.due_amount = 0;
    }
    else {
        this.status = "partial";
    }
});
// ── Indexes ───────────────────────────────────────────────────────────────────
PurchaseSchema.index({ company_id: 1, createdAt: -1 });
PurchaseSchema.index({ company_id: 1, vendor_id: 1, createdAt: -1 });
PurchaseSchema.index({ company_id: 1, status: 1 });
PurchaseSchema.index({ vendor_id: 1, status: 1 });
const Purchase = (0, mongoose_1.model)("Purchase", PurchaseSchema);
exports.default = Purchase;
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
//# sourceMappingURL=purchase.schema.js.map