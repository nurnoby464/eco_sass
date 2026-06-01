import mongoose, { Types } from "mongoose";
import { AppError } from "../../middlewares/appError";
import Invoice from "./invoice.schema";

export const getByOrderId = async (orderId: Types.ObjectId) => {
  if (!orderId) throw new AppError("orderId is required", 400);
  const invoice = await Invoice.findOne({ order: orderId }).populate(
    "company order customer items.product items.variant",
  );
  if (!invoice)
    throw new AppError("Invoice not found for the given orderId", 404);
  return invoice;
};
