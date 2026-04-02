import mongoose, { Document } from "mongoose";

export interface IAttribute {
  key: string; // "size" | "color" | "material" | anything
  value: string; // "M"    | "Red"   | "Cotton"   | anything
}

export interface IProductVariant {
  product_id: mongoose.Types.ObjectId;
  company_id: mongoose.Types.ObjectId;

  attributes: IAttribute[];

  sku: string;
  buying_price: number;
  selling_price: number;
  profit: number;
  profit_margin: number;

  stock: number;
  low_stock_alert: number;

  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductVariantDocument extends IProductVariant, Document {}
