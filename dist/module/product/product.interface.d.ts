import mongoose from "mongoose";
import { Document } from "mongoose";
export interface IProduct {
    company_id: mongoose.Types.ObjectId;
    category_id: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    description: string | null;
    images: string[];
    sku: string;
    buying_price: number;
    selling_price: number;
    profit: number;
    profit_margin: number;
    stock: number;
    low_stock_alert: number;
    has_variants: boolean;
    taxRate: number;
    is_active: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export interface IProductDocument extends IProduct, Document {
}
//# sourceMappingURL=product.interface.d.ts.map