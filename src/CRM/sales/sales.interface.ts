import mongoose, { Document } from "mongoose";

export type PaymentMethod =
  | "cash"              // staff POS — paid now
  | "cash_on_delivery"  // customer online — paid on delivery
  | "card"              // online gateway
  | "mobile_banking"    // online gateway (bKash/Nagad)
  | "credit";           // staff POS — paid later
export type PaymentStatus = "paid" | "partial" | "due";
export type SaleStatus = "completed" | "returned" | "cancelled";
export type DiscountType = "flat" | "percentage" | null;

export interface ISaleItem {
  productId: mongoose.Types.ObjectId;
  variantId: mongoose.Types.ObjectId;

  // product snapshots

  productName: string;
  color: string;
  size: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  sellingPrice: number;
  discountType: DiscountType;
  discountValue: number;
  discount_amount: number;
  subtotal: number;
}

export interface ICustomerSnapshot {
  name: string;
  phone: string;
  customerId: mongoose.Types.ObjectId | null;
}

export interface ISale {
  companyId: mongoose.Types.ObjectId;
  saleCode: string;

  customer: ICustomerSnapshot;

  items: ISaleItem[];

  grossAmount: number;
  discountTotal: number;
  netAmount: number;
  paidAmount: number;
  dueAmount: number;
  changeAmount: number;

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;

  creditUsed: number;

  saleDate: Date;
  note: string | null;
  status: SaleStatus;

  createdBy: mongoose.Types.ObjectId; // staff who made the sale
  createdAt: Date;
  updatedAt: Date;
}

export interface ISaleDocument extends ISale, Document {}
