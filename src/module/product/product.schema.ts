import { model, Schema } from "mongoose";
import { IProductDocument } from "./product.interface";

const ProductSchema = new Schema<IProductDocument>(
  {
    company_id : { type: Schema.Types.ObjectId, ref: "Company",  required: true },
    category_id: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    vendor_id  : { type: Schema.Types.ObjectId, ref: "Vendor",   required: true },
 
    name: {
      type     : String,
      required : [true, "Product name is required"],
      trim     : true,
      minlength: [2,   "Name must be at least 2 characters"],
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
 
    slug       : { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, default: null, trim: true },
    images     : { type: [String], default: [] },
 
    sku: {
      type    : String,
      required: [true, "SKU is required"],
      trim    : true,
      uppercase: true,
      // example: "GAR-MEN-SHIRT-001"
    },
 
    // ── pricing ─────────────────────────────────────────
    buying_price : { type: Number, required: true, min: 0 },
    selling_price: { type: Number, required: true, min: 0 },
    profit       : { type: Number, default: 0 },   // auto calculated
    profit_margin: { type: Number, default: 0 },   // auto calculated as %
 
    // ── stock ────────────────────────────────────────────
    stock          : { type: Number, default: 0, min: 0 },
    low_stock_alert: { type: Number, default: 10 },
 
    has_variants: { type: Boolean, default: false },
    is_active   : { type: Boolean, default: true  },
 
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);
 
// ─── Auto calculate profit before save ───────────────────
ProductSchema.pre("save", function () {
  this.profit        = this.selling_price - this.buying_price;
  this.profit_margin = this.selling_price > 0
    ? parseFloat(((this.profit / this.selling_price) * 100).toFixed(2))
    : 0;
});
 
// ─── Indexes ──────────────────────────────────────────────
ProductSchema.index({ company_id: 1, is_active: 1 });
ProductSchema.index({ company_id: 1, category_id: 1 });
ProductSchema.index({ company_id: 1, vendor_id: 1 });
ProductSchema.index({ company_id: 1, stock: 1 });          // low stock queries
ProductSchema.index({ company_id: 1, sku: 1 }, { unique: true }); // sku unique per company
ProductSchema.index({ company_id: 1, slug: 1 }, { unique: true });
 
const Product = model<IProductDocument>("Product", ProductSchema);
export default Product;