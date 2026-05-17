import mongoose, { Types } from "mongoose";
import { generateSaleCode } from "../../utils/generateSaleCode";
import { AppError } from "../../middlewares/appError";
import Product from "../../module/product/product.schema";
import ProductVariant from "../../module/product-variant/product-variant.schema";
import Customer from "../customer/customer.schema";
import { ICreateOrderPayload } from "./order.interface";

const resolveCustomer = async (
  companyId: Types.ObjectId,
  name: string,
  phone: string,
  email: string,
  session: mongoose.ClientSession,
) => {
  // check is exist customer
  const existing = await Customer.findOne({ companyId, phone }).session(
    session,
  );

  if (existing) {
    await Customer.updateOne(
      { _id: existing._id },
      { $set: { name, ...(email && { email }) } },
      { runValidators: true },
    ).session(session);
    return existing._id;
  }
  // create new customer
  const [customer] = await Customer.create(
    [
      {
        companyId,
        name,
        email,
        phone,
      },
    ],
    { session },
  );
  if (!Array.isArray(customer)) {
    throw new AppError("Failed to create customer");
  }
  return customer._id;
};
export const createOrder = async ({
  companyId,
  input,
}: ICreateOrderPayload) => {
  const {
    name,
    phone,
    email,
    items,
    shipping_address,
    discount_amount,
    tax_amount,
    shipping_charge,
    paid_amount,
    payment_method,
    note,
  } = input;

  const session = await mongoose.startSession();
  try {
    await session.startTransaction();
  } catch (error) {
    await session.abortTransaction();
  } finally {
    session.endSession();
  }
};
