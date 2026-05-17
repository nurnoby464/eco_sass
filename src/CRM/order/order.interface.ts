import { Document, Types } from "mongoose";
import { PaymentMethod } from "../sales/sales.interface";
import { TCreateOrderInput } from "./order.validation";

export type TOrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type TPaymentStatus = "unpaid" | "partial" | "paid";


export interface IOrderItem {
  product_id: Types.ObjectId;
  variant_id: Types.ObjectId;
  name: string;        // snapshot — product name at order time
  sku: string;         // snapshot
  quantity: number;
  unit_price: number;
  total_price: number; // quantity * unit_price
}

export interface IShippingAddress {
  name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  zip: string | null;
}

export interface IOrder {
  company_id: Types.ObjectId;
  order_number: string;        // e.g. "ORD-0001"
  customer_id: Types.ObjectId;

  items: IOrderItem[];
  shipping_address: IShippingAddress;

  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_charge: number;
  grand_total: number;

  paid_amount: number;
  due_amount: number;          // grand_total - paid_amount

  payment_status: TPaymentStatus;
  payment_method: PaymentMethod | null;
  order_status: TOrderStatus;

  note: string | null;
}

export interface IOrderDocument extends IOrder, Document {}

export interface ICreateOrderPayload {
  companyId: Types.ObjectId;
  input: TCreateOrderInput;
}