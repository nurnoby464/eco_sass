import { model, Schema } from "mongoose";
import { IAttribute, IProductVariantDocument } from "./product-variant.interface";

const AttributeSchema = new Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const ProductVariantSchema = new Schema<IProductVariantDocument>(
  {
    product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    company_id: { type: Schema.Types.ObjectId, ref: "Company", required: true },

    attributes: {
      type: [AttributeSchema],
      required: true,
      validate: {
        validator: (v: IAttribute[]) => v.length > 0,
        message: "At least one attribute is required",
      },
    },

    sku: {
      type: String,
      required: [true, "Variant SKU is required"],
      trim: true,
      uppercase: true,
      // example: "GAR-MEN-SHIRT-001-M-RED"
    },

    buying_price: { type: Number, required: true, min: 0 },
    selling_price: { type: Number, required: true, min: 0 },
    profit: { type: Number, default: 0 },
    profit_margin: { type: Number, default: 0 },

    stock: { type: Number, default: 0, min: 0 },
    low_stock_alert: { type: Number, default: 5 },

    is_active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// ─── Auto calculate profit ────────────────────────────────
ProductVariantSchema.pre("save", function () {
  this.profit = this.selling_price - this.buying_price;
  this.profit_margin =
    this.selling_price > 0
      ? parseFloat(((this.profit / this.selling_price) * 100).toFixed(2))
      : 0;
});

// ─── Indexes ──────────────────────────────────────────────
ProductVariantSchema.index({ product_id: 1, is_active: 1 });
ProductVariantSchema.index({ company_id: 1, stock: 1 });
ProductVariantSchema.index({ company_id: 1, sku: 1 }, { unique: true }); // sku unique per company
// find all variants of a product by a specific attribute
ProductVariantSchema.index({ product_id: 1, "attributes.key": 1, "attributes.value": 1 });

const ProductVariant = model<IProductVariantDocument>(
  "ProductVariant",
  ProductVariantSchema,
);
export default ProductVariant;
